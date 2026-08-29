package com.example.budget.service;

import com.example.budget.dto.HouseholdRequests;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.model.Household;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.HouseholdRole;
import com.example.budget.model.User;
import com.example.budget.repository.HouseholdAttachmentRepository;
import com.example.budget.repository.HouseholdExpenseRepository;
import com.example.budget.repository.HouseholdExpenseShareRepository;
import com.example.budget.repository.HouseholdInvitationRepository;
import com.example.budget.repository.HouseholdMemberRepository;
import com.example.budget.repository.HouseholdRepository;
import com.example.budget.repository.HouseholdSettlementRepository;
import com.example.budget.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HouseholdMemberNameServiceTest {
    @Mock private HouseholdRepository householdRepository;
    @Mock private HouseholdMemberRepository memberRepository;
    @Mock private HouseholdInvitationRepository invitationRepository;
    @Mock private HouseholdExpenseRepository expenseRepository;
    @Mock private HouseholdExpenseShareRepository shareRepository;
    @Mock private HouseholdSettlementRepository settlementRepository;
    @Mock private HouseholdAttachmentRepository attachmentRepository;
    @Mock private HouseholdCleaningService cleaningService;
    @Mock private HouseholdNotificationService notificationService;
    @Mock private UserRepository userRepository;
    @Mock private User user;
    @Mock private Household household;
    @Mock private HouseholdMember current;
    @Mock private HouseholdMember target;

    private HouseholdService service;

    @BeforeEach
    void setUp() {
        service = new HouseholdService(
                householdRepository,
                memberRepository,
                invitationRepository,
                expenseRepository,
                shareRepository,
                settlementRepository,
                attachmentRepository,
                cleaningService,
                notificationService,
                userRepository);
    }

    @Test
    void ownerCanCorrectAHouseholdMemberName() {
        stubCurrentMember(HouseholdRole.OWNER);
        when(memberRepository.findByHouseholdIdAndIdAndActiveTrue(10L, 20L))
                .thenReturn(Optional.of(target));

        service.updateMemberName(
                10L,
                20L,
                new HouseholdRequests.UpdateMemberName("  João da Silva  "),
                user);

        verify(target).setDisplayName("João da Silva");
        verify(memberRepository).save(target);
    }

    @Test
    void ordinaryMemberCannotRenameAnotherMember() {
        stubCurrentMember(HouseholdRole.MEMBER);

        assertThatThrownBy(() -> service.updateMemberName(
                10L,
                20L,
                new HouseholdRequests.UpdateMemberName("New name"),
                user))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Household owner access required");

        verify(memberRepository, never())
                .findByHouseholdIdAndIdAndActiveTrue(10L, 20L);
        verify(memberRepository, never()).save(target);
    }

    private void stubCurrentMember(HouseholdRole role) {
        when(memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user))
                .thenReturn(Optional.of(current));
        when(current.getHousehold()).thenReturn(household);
        when(household.getId()).thenReturn(10L);
        when(current.getRole()).thenReturn(role);
    }
}
