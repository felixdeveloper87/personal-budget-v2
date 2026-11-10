package com.example.budget.household.controller;

import com.example.budget.household.dto.HouseholdPageDTO;
import com.example.budget.household.dto.HouseholdRequests;
import com.example.budget.household.service.HouseholdDashboardService;
import com.example.budget.household.service.HouseholdService;
import com.example.budget.household.dto.HouseholdRecordCreatedDTO;
import com.example.budget.household.dto.HouseholdExpenseHistoryDTO;
import com.example.budget.household.service.HouseholdInvitationService;
import com.example.budget.household.service.HouseholdCleaningService;
import com.example.budget.household.service.HouseholdExpenseService;
import com.example.budget.household.dto.HouseholdPaymentHistoryDTO;
import com.example.budget.household.service.HouseholdSettlementService;
import com.example.budget.household.service.HouseholdAttachmentService;

import com.example.budget.model.User;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class HouseholdController {
    private final HouseholdService service;
    private final HouseholdDashboardService dashboardService;
    private final HouseholdInvitationService invitationService;
    private final HouseholdExpenseService expenseService;
    private final HouseholdSettlementService settlementService;
    private final HouseholdAttachmentService attachmentService;
    private final HouseholdCleaningService cleaningService;

    public HouseholdController(
            HouseholdService service,
            HouseholdDashboardService dashboardService,
            HouseholdInvitationService invitationService,
            HouseholdExpenseService expenseService,
            HouseholdSettlementService settlementService,
            HouseholdAttachmentService attachmentService,
            HouseholdCleaningService cleaningService) {
        this.service = service;
        this.dashboardService = dashboardService;
        this.invitationService = invitationService;
        this.expenseService = expenseService;
        this.settlementService = settlementService;
        this.attachmentService = attachmentService;
        this.cleaningService = cleaningService;
    }

    @GetMapping("/households/current")
    public HouseholdPageDTO current(Authentication authentication) {
        return dashboardService.page(user(authentication));
    }

    @PostMapping("/households")
    @ResponseStatus(HttpStatus.CREATED)
    public HouseholdPageDTO create(
            @RequestBody HouseholdRequests.CreateHousehold request,
            Authentication authentication) {
        User user = user(authentication);
        service.create(request, user);
        return dashboardService.page(user);
    }

    @PatchMapping("/households/{householdId}")
    public HouseholdPageDTO update(
            @PathVariable Long householdId,
            @RequestBody HouseholdRequests.UpdateHousehold request,
            Authentication authentication) {
        User user = user(authentication);
        service.update(householdId, request, user);
        return dashboardService.page(user);
    }

    @PostMapping("/households/{householdId}/invitations")
    public HouseholdPageDTO invite(
            @PathVariable Long householdId,
            @RequestBody HouseholdRequests.InviteMember request,
            Authentication authentication) {
        User user = user(authentication);
        invitationService.invite(householdId, request, user);
        return dashboardService.page(user);
    }

    @DeleteMapping("/households/{householdId}/invitations/{invitationId}")
    public HouseholdPageDTO revokeInvitation(
            @PathVariable Long householdId,
            @PathVariable Long invitationId,
            Authentication authentication) {
        User user = user(authentication);
        invitationService.revokeInvitation(householdId, invitationId, user);
        return dashboardService.page(user);
    }

    @PostMapping("/household-invitations/{invitationId}/accept")
    public HouseholdPageDTO acceptInvitation(
            @PathVariable Long invitationId,
            Authentication authentication) {
        User user = user(authentication);
        invitationService.acceptInvitation(invitationId, user);
        return dashboardService.page(user);
    }

    @PostMapping("/household-invitations/{invitationId}/decline")
    public HouseholdPageDTO declineInvitation(
            @PathVariable Long invitationId,
            Authentication authentication) {
        User user = user(authentication);
        invitationService.declineInvitation(invitationId, user);
        return dashboardService.page(user);
    }

    @DeleteMapping("/households/{householdId}/members/{memberId}")
    public HouseholdPageDTO deactivateMember(
            @PathVariable Long householdId,
            @PathVariable Long memberId,
            Authentication authentication) {
        User user = user(authentication);
        service.deactivateMember(householdId, memberId, user);
        return dashboardService.page(user);
    }

    @PatchMapping("/households/{householdId}/members/{memberId}")
    public HouseholdPageDTO updateMemberName(
            @PathVariable Long householdId,
            @PathVariable Long memberId,
            @RequestBody HouseholdRequests.UpdateMemberName request,
            Authentication authentication) {
        User user = user(authentication);
        service.updateMemberName(householdId, memberId, request, user);
        return dashboardService.page(user);
    }

    @PostMapping("/households/{householdId}/notifications/read")
    public HouseholdPageDTO markNotificationsRead(
            @PathVariable Long householdId,
            Authentication authentication) {
        User user = user(authentication);
        service.markNotificationsRead(householdId, user);
        return dashboardService.page(user);
    }

    @PutMapping("/households/{householdId}/cleaning-rotation")
    public HouseholdPageDTO configureCleaningRotation(
            @PathVariable Long householdId,
            @RequestBody HouseholdRequests.CleaningRotation request,
            Authentication authentication) {
        User user = user(authentication);
        cleaningService.configure(householdId, request, user);
        return dashboardService.page(user);
    }

    @PostMapping(
            "/households/{householdId}/cleaning-assignments/{assignmentId}/complete")
    public HouseholdPageDTO completeCleaningAssignment(
            @PathVariable Long householdId,
            @PathVariable Long assignmentId,
            Authentication authentication) {
        User user = user(authentication);
        cleaningService.completeCurrentWeek(householdId, assignmentId, user);
        return dashboardService.page(user);
    }

    @PatchMapping(
            "/households/{householdId}/cleaning-assignments/{assignmentId}/duties/{dutyKey}")
    public HouseholdPageDTO updateCleaningDuty(
            @PathVariable Long householdId,
            @PathVariable Long assignmentId,
            @PathVariable String dutyKey,
            @RequestBody HouseholdRequests.CleaningDutyUpdate request,
            Authentication authentication) {
        if (request == null) {
            throw new IllegalArgumentException("Cleaning duty state is required");
        }
        User user = user(authentication);
        cleaningService.updateDuty(
                householdId,
                assignmentId,
                dutyKey,
                request.completed(),
                user);
        return dashboardService.page(user);
    }

    @GetMapping("/households/{householdId}/expenses")
    public HouseholdExpenseHistoryDTO expenseHistory(
            @PathVariable Long householdId,
            @RequestParam(defaultValue = "0") int page,
            Authentication authentication) {
        return expenseService.expenseHistory(householdId, page, user(authentication));
    }

    @PostMapping("/households/{householdId}/expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public HouseholdRecordCreatedDTO createExpense(
            @PathVariable Long householdId,
            @RequestBody HouseholdRequests.Expense request,
            Authentication authentication) {
        User user = user(authentication);
        Long expenseId = expenseService.createExpense(householdId, request, user);
        return new HouseholdRecordCreatedDTO(expenseId, dashboardService.page(user));
    }

    @PostMapping(
            value = "/households/{householdId}/expenses/{expenseId}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public HouseholdPageDTO uploadExpenseAttachments(
            @PathVariable Long householdId,
            @PathVariable Long expenseId,
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication) {
        User user = user(authentication);
        attachmentService.uploadToExpense(householdId, expenseId, files, user);
        return dashboardService.page(user);
    }

    @PutMapping("/households/{householdId}/expenses/{expenseId}")
    public HouseholdPageDTO updateExpense(
            @PathVariable Long householdId,
            @PathVariable Long expenseId,
            @RequestBody HouseholdRequests.Expense request,
            Authentication authentication) {
        User user = user(authentication);
        expenseService.updateExpense(householdId, expenseId, request, user);
        return dashboardService.page(user);
    }

    @DeleteMapping("/households/{householdId}/expenses/{expenseId}")
    public HouseholdPageDTO voidExpense(
            @PathVariable Long householdId,
            @PathVariable Long expenseId,
            Authentication authentication) {
        User user = user(authentication);
        expenseService.voidExpense(householdId, expenseId, user);
        return dashboardService.page(user);
    }

    @GetMapping("/households/{householdId}/settlements")
    public HouseholdPaymentHistoryDTO paymentHistory(
            @PathVariable Long householdId,
            @RequestParam(defaultValue = "0") int page,
            Authentication authentication) {
        return settlementService.paymentHistory(householdId, page, user(authentication));
    }

    @PostMapping("/households/{householdId}/settlements")
    @ResponseStatus(HttpStatus.CREATED)
    public HouseholdRecordCreatedDTO createSettlement(
            @PathVariable Long householdId,
            @RequestBody HouseholdRequests.Settlement request,
            Authentication authentication) {
        User user = user(authentication);
        Long settlementId = settlementService.createSettlement(householdId, request, user);
        return new HouseholdRecordCreatedDTO(settlementId, dashboardService.page(user));
    }

    @PostMapping(
            value = "/households/{householdId}/settlements/{settlementId}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public HouseholdPageDTO uploadSettlementAttachments(
            @PathVariable Long householdId,
            @PathVariable Long settlementId,
            @RequestParam("files") List<MultipartFile> files,
            Authentication authentication) {
        User user = user(authentication);
        attachmentService.uploadToSettlement(householdId, settlementId, files, user);
        return dashboardService.page(user);
    }

    @GetMapping("/households/{householdId}/attachments/{attachmentId}/content")
    public ResponseEntity<Resource> attachmentContent(
            @PathVariable Long householdId,
            @PathVariable Long attachmentId,
            Authentication authentication) {
        HouseholdAttachmentService.AttachmentContent content =
                attachmentService.content(householdId, attachmentId, user(authentication));
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(content.originalFilename(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(content.contentType()))
                .contentLength(content.sizeBytes())
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(new FileSystemResource(content.path()));
    }

    @DeleteMapping("/households/{householdId}/attachments/{attachmentId}")
    public HouseholdPageDTO removeAttachment(
            @PathVariable Long householdId,
            @PathVariable Long attachmentId,
            Authentication authentication) {
        User user = user(authentication);
        attachmentService.remove(householdId, attachmentId, user);
        return dashboardService.page(user);
    }

    private User user(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
