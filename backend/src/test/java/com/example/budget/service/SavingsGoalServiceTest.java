package com.example.budget.service;

import com.example.budget.dto.SavingsGoalRequest;
import com.example.budget.model.SavingsGoal;
import com.example.budget.model.User;
import com.example.budget.repository.SavingsGoalContributionRepository;
import com.example.budget.repository.SavingsGoalRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SavingsGoalServiceTest {

    @Mock
    private SavingsGoalRepository goalRepository;
    @Mock
    private SavingsGoalContributionRepository contributionRepository;

    @Test
    void updateMetadataPreservesAccumulatedAmount() {
        User user = new User();
        user.setId(10L);

        SavingsGoal goal = new SavingsGoal();
        ReflectionTestUtils.setField(goal, "id", 5L);
        goal.setUser(user);
        goal.setName("Emergency fund");
        goal.setTargetAmount(new BigDecimal("1000.00"));
        goal.setCurrentAmount(new BigDecimal("125.00"));

        SavingsGoalRequest request = new SavingsGoalRequest();
        request.setName("Emergency reserve");
        request.setTargetAmount(new BigDecimal("1500.00"));
        request.setCurrentAmount(BigDecimal.ZERO);

        when(goalRepository.findById(5L)).thenReturn(Optional.of(goal));
        when(goalRepository.save(goal)).thenReturn(goal);

        SavingsGoalService service = new SavingsGoalService(goalRepository, contributionRepository);
        var result = service.update(5L, request, user);

        assertThat(result.currentAmount()).isEqualByComparingTo("125.00");
        assertThat(result.targetAmount()).isEqualByComparingTo("1500.00");
    }
}
