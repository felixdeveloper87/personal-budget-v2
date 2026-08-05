package com.example.budget.controller;

import com.example.budget.dto.HouseholdPageDTO;
import com.example.budget.dto.HouseholdRequests;
import com.example.budget.model.User;
import com.example.budget.service.HouseholdService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class HouseholdController {
    private final HouseholdService service;

    public HouseholdController(HouseholdService service) {
        this.service = service;
    }

    @GetMapping("/households/current")
    public HouseholdPageDTO current(Authentication authentication) {
        return service.page(user(authentication));
    }

    @PostMapping("/households")
    @ResponseStatus(HttpStatus.CREATED)
    public HouseholdPageDTO create(
            @RequestBody HouseholdRequests.CreateHousehold request,
            Authentication authentication) {
        User user = user(authentication);
        service.create(request, user);
        return service.page(user);
    }

    @PatchMapping("/households/{householdId}")
    public HouseholdPageDTO update(
            @PathVariable Long householdId,
            @RequestBody HouseholdRequests.UpdateHousehold request,
            Authentication authentication) {
        User user = user(authentication);
        service.update(householdId, request, user);
        return service.page(user);
    }

    @PostMapping("/households/{householdId}/invitations")
    public HouseholdPageDTO invite(
            @PathVariable Long householdId,
            @RequestBody HouseholdRequests.InviteMember request,
            Authentication authentication) {
        User user = user(authentication);
        service.invite(householdId, request, user);
        return service.page(user);
    }

    @DeleteMapping("/households/{householdId}/invitations/{invitationId}")
    public HouseholdPageDTO revokeInvitation(
            @PathVariable Long householdId,
            @PathVariable Long invitationId,
            Authentication authentication) {
        User user = user(authentication);
        service.revokeInvitation(householdId, invitationId, user);
        return service.page(user);
    }

    @PostMapping("/household-invitations/{invitationId}/accept")
    public HouseholdPageDTO acceptInvitation(
            @PathVariable Long invitationId,
            Authentication authentication) {
        User user = user(authentication);
        service.acceptInvitation(invitationId, user);
        return service.page(user);
    }

    @PostMapping("/household-invitations/{invitationId}/decline")
    public HouseholdPageDTO declineInvitation(
            @PathVariable Long invitationId,
            Authentication authentication) {
        User user = user(authentication);
        service.declineInvitation(invitationId, user);
        return service.page(user);
    }

    @DeleteMapping("/households/{householdId}/members/{memberId}")
    public HouseholdPageDTO deactivateMember(
            @PathVariable Long householdId,
            @PathVariable Long memberId,
            Authentication authentication) {
        User user = user(authentication);
        service.deactivateMember(householdId, memberId, user);
        return service.page(user);
    }

    @PostMapping("/households/{householdId}/expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public HouseholdPageDTO createExpense(
            @PathVariable Long householdId,
            @RequestBody HouseholdRequests.Expense request,
            Authentication authentication) {
        User user = user(authentication);
        service.createExpense(householdId, request, user);
        return service.page(user);
    }

    @PutMapping("/households/{householdId}/expenses/{expenseId}")
    public HouseholdPageDTO updateExpense(
            @PathVariable Long householdId,
            @PathVariable Long expenseId,
            @RequestBody HouseholdRequests.Expense request,
            Authentication authentication) {
        User user = user(authentication);
        service.updateExpense(householdId, expenseId, request, user);
        return service.page(user);
    }

    @DeleteMapping("/households/{householdId}/expenses/{expenseId}")
    public HouseholdPageDTO voidExpense(
            @PathVariable Long householdId,
            @PathVariable Long expenseId,
            Authentication authentication) {
        User user = user(authentication);
        service.voidExpense(householdId, expenseId, user);
        return service.page(user);
    }

    @PostMapping("/households/{householdId}/settlements")
    @ResponseStatus(HttpStatus.CREATED)
    public HouseholdPageDTO createSettlement(
            @PathVariable Long householdId,
            @RequestBody HouseholdRequests.Settlement request,
            Authentication authentication) {
        User user = user(authentication);
        service.createSettlement(householdId, request, user);
        return service.page(user);
    }

    @PostMapping("/households/{householdId}/settlements/{settlementId}/confirm")
    public HouseholdPageDTO confirmSettlement(
            @PathVariable Long householdId,
            @PathVariable Long settlementId,
            Authentication authentication) {
        User user = user(authentication);
        service.confirmSettlement(householdId, settlementId, user);
        return service.page(user);
    }

    @PostMapping("/households/{householdId}/settlements/{settlementId}/reject")
    public HouseholdPageDTO rejectSettlement(
            @PathVariable Long householdId,
            @PathVariable Long settlementId,
            Authentication authentication) {
        User user = user(authentication);
        service.rejectSettlement(householdId, settlementId, user);
        return service.page(user);
    }

    @PostMapping("/households/{householdId}/settlements/{settlementId}/cancel")
    public HouseholdPageDTO cancelSettlement(
            @PathVariable Long householdId,
            @PathVariable Long settlementId,
            Authentication authentication) {
        User user = user(authentication);
        service.cancelSettlement(householdId, settlementId, user);
        return service.page(user);
    }

    private User user(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}

