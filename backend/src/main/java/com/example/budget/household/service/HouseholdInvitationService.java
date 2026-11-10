package com.example.budget.household.service;

import com.example.budget.household.model.HouseholdMember;
import com.example.budget.household.repository.HouseholdInvitationRepository;
import com.example.budget.household.dto.HouseholdRequests;
import com.example.budget.household.model.HouseholdInvitation;
import com.example.budget.household.repository.HouseholdMemberRepository;
import com.example.budget.household.model.HouseholdRole;
import com.example.budget.household.model.HouseholdNotificationType;
import com.example.budget.household.model.HouseholdInvitationStatus;

import com.example.budget.shared.exception.EntityNotFoundException;
import com.example.budget.user.model.User;
import com.example.budget.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

import static com.example.budget.household.service.HouseholdValues.requiredText;

/** Invitation lifecycle: the owner invites/revokes, the invited user accepts/declines. */
@Service
public class HouseholdInvitationService {
    private final HouseholdMemberRepository memberRepository;
    private final HouseholdInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final HouseholdAccess access;
    private final HouseholdNotificationService notificationService;

    public HouseholdInvitationService(
            HouseholdMemberRepository memberRepository,
            HouseholdInvitationRepository invitationRepository,
            UserRepository userRepository,
            HouseholdAccess access,
            HouseholdNotificationService notificationService) {
        this.memberRepository = memberRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.access = access;
        this.notificationService = notificationService;
    }

    @Transactional
    public void invite(Long householdId, HouseholdRequests.InviteMember request, User user) {
        HouseholdMember owner = access.requireMember(householdId, user);
        access.requireOwner(owner);

        String email = requiredText(request.email(), "Email", 255).toLowerCase(Locale.ROOT);
        User target = userRepository.findByEmailIgnoreCase(email)
                .filter(User::isApproved)
                .orElseThrow(() -> new IllegalArgumentException(
                        "The member must have an approved Personal Budget account"));

        if (target.getId().equals(user.getId())) {
            throw new IllegalArgumentException("You are already in this household");
        }
        if (memberRepository.existsByUserAndActiveTrue(target)) {
            throw new IllegalArgumentException("This user already belongs to an active household");
        }
        if (invitationRepository.existsByHouseholdAndTargetUserAndStatus(
                owner.getHousehold(), target, HouseholdInvitationStatus.PENDING)) {
            throw new IllegalArgumentException("An invitation is already pending for this user");
        }

        HouseholdInvitation invitation = new HouseholdInvitation();
        invitation.setHousehold(owner.getHousehold());
        invitation.setTargetUser(target);
        invitation.setInvitedBy(user);
        invitation.setStatus(HouseholdInvitationStatus.PENDING);
        invitationRepository.save(invitation);
    }

    @Transactional
    public void acceptInvitation(Long invitationId, User user) {
        HouseholdInvitation invitation = invitationRepository.findByIdAndTargetUser(invitationId, user)
                .orElseThrow(() -> new EntityNotFoundException("HouseholdInvitation", invitationId));
        requirePending(invitation);
        if (memberRepository.existsByUserAndActiveTrue(user)) {
            throw new IllegalArgumentException(
                    "Leave your current household before accepting another invitation");
        }

        HouseholdMember member = memberRepository
                .findByHouseholdAndUser(invitation.getHousehold(), user)
                .orElseGet(HouseholdMember::new);
        member.setHousehold(invitation.getHousehold());
        member.setUser(user);
        member.setRole(HouseholdRole.MEMBER);
        member.setActive(true);
        member.setDeactivatedAt(null);
        memberRepository.save(member);

        invitation.setStatus(HouseholdInvitationStatus.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
        notificationService.notifyHousehold(
                invitation.getHousehold(),
                member,
                HouseholdNotificationType.MEMBER_JOINED,
                member.getId(),
                user.getName(),
                null);
    }

    @Transactional
    public void declineInvitation(Long invitationId, User user) {
        HouseholdInvitation invitation = invitationRepository.findByIdAndTargetUser(invitationId, user)
                .orElseThrow(() -> new EntityNotFoundException("HouseholdInvitation", invitationId));
        requirePending(invitation);
        invitation.setStatus(HouseholdInvitationStatus.DECLINED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    @Transactional
    public void revokeInvitation(Long householdId, Long invitationId, User user) {
        HouseholdMember owner = access.requireMember(householdId, user);
        access.requireOwner(owner);
        HouseholdInvitation invitation =
                invitationRepository.findByIdAndHousehold(invitationId, owner.getHousehold())
                        .orElseThrow(() -> new EntityNotFoundException(
                                "HouseholdInvitation", invitationId));
        requirePending(invitation);
        invitation.setStatus(HouseholdInvitationStatus.REVOKED);
        invitation.setRespondedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
    }

    private void requirePending(HouseholdInvitation invitation) {
        if (invitation.getStatus() != HouseholdInvitationStatus.PENDING) {
            throw new IllegalArgumentException("This invitation is no longer pending");
        }
    }
}
