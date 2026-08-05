package com.example.budget.service;

import com.example.budget.exception.AccessDeniedException;
import com.example.budget.model.*;
import com.example.budget.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HouseholdAttachmentServiceTest {
    @Mock
    private HouseholdMemberRepository memberRepository;
    @Mock
    private HouseholdExpenseRepository expenseRepository;
    @Mock
    private HouseholdSettlementRepository settlementRepository;
    @Mock
    private HouseholdAttachmentRepository attachmentRepository;
    @Mock
    private HouseholdAttachmentStorage storage;
    @Mock
    private User user;
    @Mock
    private Household household;
    @Mock
    private HouseholdMember current;
    @Mock
    private HouseholdMember payer;
    @Mock
    private HouseholdExpense expense;

    private HouseholdAttachmentService service;

    @BeforeEach
    void setUp() {
        service = new HouseholdAttachmentService(
                memberRepository,
                expenseRepository,
                settlementRepository,
                attachmentRepository,
                storage,
                5,
                90);
    }

    @Test
    void nonPayerMemberCannotUploadToAnExpense() {
        when(memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user))
                .thenReturn(Optional.of(current));
        when(current.getHousehold()).thenReturn(household);
        when(household.getId()).thenReturn(10L);
        when(current.getRole()).thenReturn(HouseholdRole.MEMBER);
        when(current.getId()).thenReturn(20L);
        when(expenseRepository.findByIdAndHouseholdAndVoidedAtIsNull(30L, household))
                .thenReturn(Optional.of(expense));
        when(expense.getPayer()).thenReturn(payer);
        when(payer.getId()).thenReturn(21L);

        assertThatThrownBy(() -> service.uploadToExpense(
                10L,
                30L,
                List.of(image()),
                user))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(storage);
    }

    @Test
    void recordCannotExceedFiveAvailableImages() {
        when(memberRepository.findFirstByUserAndActiveTrueOrderByJoinedAtAsc(user))
                .thenReturn(Optional.of(current));
        when(current.getHousehold()).thenReturn(household);
        when(household.getId()).thenReturn(10L);
        when(current.getRole()).thenReturn(HouseholdRole.MEMBER);
        when(current.getId()).thenReturn(20L);
        when(expenseRepository.findByIdAndHouseholdAndVoidedAtIsNull(30L, household))
                .thenReturn(Optional.of(expense));
        when(expense.getPayer()).thenReturn(current);
        when(expense.getHousehold()).thenReturn(household);
        when(attachmentRepository.countByExpenseAndStatusAndExpiresAtAfter(
                eq(expense),
                eq(HouseholdAttachmentStatus.AVAILABLE),
                any()))
                .thenReturn(5L);

        assertThatThrownBy(() -> service.uploadToExpense(
                10L,
                30L,
                List.of(image()),
                user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Each record can have up to 5 images");
        verifyNoInteractions(storage);
    }

    private MockMultipartFile image() {
        return new MockMultipartFile(
                "files",
                "receipt.jpg",
                "image/jpeg",
                new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01});
    }
}
