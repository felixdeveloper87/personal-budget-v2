package com.example.budget.service;

import com.example.budget.exception.AccessDeniedException;
import com.example.budget.model.HouseholdExpense;
import com.example.budget.model.HouseholdMember;
import com.example.budget.model.HouseholdRole;
import com.example.budget.model.User;
import com.example.budget.repository.HouseholdMemberRepository;
import org.springframework.stereotype.Component;

/** Permission checks shared by the household services. */
@Component
public class HouseholdAccess {
    private final HouseholdMemberRepository memberRepository;

    public HouseholdAccess(HouseholdMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    /** Returns the user's active membership, which must belong to {@code householdId}. */
    public HouseholdMember requireMember(Long householdId, User user) {
        HouseholdMember member = memberRepository
                .findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user)
                .orElseThrow(() -> new AccessDeniedException(
                        "Active household membership required"));
        if (!member.getHousehold().getId().equals(householdId)) {
            throw new AccessDeniedException("Active household membership required");
        }
        return member;
    }

    public void requireOwner(HouseholdMember member) {
        if (member.getRole() != HouseholdRole.OWNER) {
            throw new AccessDeniedException("Household owner access required");
        }
    }

    /** The owner can edit any expense; other members only the ones they paid. */
    public void requireExpenseEditor(HouseholdExpense expense, HouseholdMember current) {
        if (current.getRole() != HouseholdRole.OWNER
                && !expense.getPayer().getId().equals(current.getId())) {
            throw new AccessDeniedException("You cannot edit this household expense");
        }
    }
}
