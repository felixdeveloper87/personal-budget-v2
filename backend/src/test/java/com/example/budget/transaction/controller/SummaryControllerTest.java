package com.example.budget.transaction.controller;

import com.example.budget.transaction.dto.MonthlySummary;
import com.example.budget.model.User;
import com.example.budget.transaction.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SummaryControllerTest {
    private final TransactionService service = mock(TransactionService.class);
    private final User user = new User("user@example.com", "secret", "User");
    private final MockMvc mvc = MockMvcBuilders
            .standaloneSetup(new SummaryController(service))
            .build();

    @Test
    void monthSummaryKeepsItsOriginalUrl() throws Exception {
        when(service.monthlySummary(2026, 11, user)).thenReturn(new MonthlySummary());

        mvc.perform(get("/api/summary/month")
                        .param("year", "2026")
                        .param("month", "11")
                        .principal(new UsernamePasswordAuthenticationToken(user, null, List.of())))
                .andExpect(status().isOk());

        verify(service).monthlySummary(2026, 11, user);
    }
}
