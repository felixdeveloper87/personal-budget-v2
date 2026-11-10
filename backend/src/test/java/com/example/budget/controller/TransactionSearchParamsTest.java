package com.example.budget.controller;

import com.example.budget.exception.GlobalExceptionHandler;
import com.example.budget.mapper.TransactionMapper;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.service.TransactionService;
import com.example.budget.util.TransactionTypeConverter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.format.support.DefaultFormattingConversionService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Checks how GET /api/transactions/search binds and validates its query parameters. */
class TransactionSearchParamsTest {
    private final TransactionService service = mock(TransactionService.class);
    private final TransactionMapper mapper = mock(TransactionMapper.class);
    private final User user = new User("user@example.com", "secret", "User");
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        DefaultFormattingConversionService conversion = new DefaultFormattingConversionService();
        conversion.addConverter(new TransactionTypeConverter());
        mvc = MockMvcBuilders.standaloneSetup(new TransactionController(service, mapper))
                .setConversionService(conversion)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        when(service.searchTransactions(any(), any(), any(), any(), any(), any())).thenReturn(List.of());
        when(mapper.toDTOList(any())).thenReturn(List.of());
    }

    @Test
    void bindsLowercaseTypeAndIsoDates() throws Exception {
        mvc.perform(get("/api/transactions/search")
                        .param("type", "expense")
                        .param("startDate", "2026-01-01")
                        .param("endDate", "2026-01-31")
                        .principal(auth()))
                .andExpect(status().isOk());

        verify(service).searchTransactions(
                isNull(),
                eq(TransactionType.EXPENSE),
                isNull(),
                eq(LocalDate.of(2026, 1, 1)),
                eq(LocalDate.of(2026, 1, 31)),
                eq(user));
    }

    @Test
    void missingOrBlankFiltersMeanNoFilter() throws Exception {
        mvc.perform(get("/api/transactions/search")
                        .param("type", "")
                        .param("startDate", "")
                        .principal(auth()))
                .andExpect(status().isOk());

        verify(service).searchTransactions(isNull(), isNull(), isNull(), isNull(), isNull(), eq(user));
    }

    @Test
    void invalidDateReturnsBadRequest() throws Exception {
        mvc.perform(get("/api/transactions/search")
                        .param("startDate", "31/01/2026")
                        .principal(auth()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid value for parameter 'startDate'"));

        verifyNoInteractions(service);
    }

    @Test
    void unknownTypeReturnsBadRequest() throws Exception {
        mvc.perform(get("/api/transactions/search")
                        .param("type", "transfer")
                        .principal(auth()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid value for parameter 'type'"));

        verifyNoInteractions(service);
    }

    private UsernamePasswordAuthenticationToken auth() {
        return new UsernamePasswordAuthenticationToken(user, null, List.of());
    }
}
