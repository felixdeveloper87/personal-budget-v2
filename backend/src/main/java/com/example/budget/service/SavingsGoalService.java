package com.example.budget.service;

import com.example.budget.dto.SavingsGoalContributionRequest;
import com.example.budget.dto.SavingsGoalDTO;
import com.example.budget.dto.SavingsGoalRequest;
import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.SavingsGoal;
import com.example.budget.model.SavingsGoalContribution;
import com.example.budget.model.User;
import com.example.budget.repository.SavingsGoalContributionRepository;
import com.example.budget.repository.SavingsGoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class SavingsGoalService {
    private final SavingsGoalRepository goalRepository;
    private final SavingsGoalContributionRepository contributionRepository;

    public SavingsGoalService(
            SavingsGoalRepository goalRepository,
            SavingsGoalContributionRepository contributionRepository) {
        this.goalRepository = goalRepository;
        this.contributionRepository = contributionRepository;
    }

    @Transactional(readOnly = true)
    public List<SavingsGoalDTO> list(User user) {
        return goalRepository.findByUserOrderByArchivedAscTargetDateAscIdDesc(user)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public SavingsGoalDTO create(SavingsGoalRequest request, User user) {
        SavingsGoal goal = new SavingsGoal();
        goal.setUser(user);
        applyMetadata(goal, request);
        BigDecimal current = request.getCurrentAmount() != null
                ? request.getCurrentAmount()
                : BigDecimal.ZERO;
        if (current.signum() < 0) {
            throw new IllegalArgumentException("Current amount cannot be negative");
        }
        goal.setCurrentAmount(current);
        return toDTO(goalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalDTO update(Long id, SavingsGoalRequest request, User user) {
        SavingsGoal goal = getOwned(id, user);
        applyMetadata(goal, request);
        return toDTO(goalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalDTO contribute(Long id, SavingsGoalContributionRequest request, User user) {
        SavingsGoal goal = getOwned(id, user);
        if (request.getAmount().signum() == 0) {
            throw new IllegalArgumentException("Contribution amount cannot be zero");
        }
        BigDecimal next = goal.getCurrentAmount().add(request.getAmount());
        if (next.signum() < 0) {
            throw new IllegalArgumentException("A withdrawal cannot make the goal balance negative");
        }

        SavingsGoalContribution contribution = new SavingsGoalContribution();
        contribution.setGoal(goal);
        contribution.setAmount(request.getAmount());
        contribution.setContributionDate(
                request.getContributionDate() != null ? request.getContributionDate() : LocalDate.now());
        contribution.setNote(request.getNote());
        contributionRepository.save(contribution);

        goal.setCurrentAmount(next);
        return toDTO(goalRepository.save(goal));
    }

    @Transactional
    public void archive(Long id, User user) {
        SavingsGoal goal = getOwned(id, user);
        goal.setArchived(true);
        goalRepository.save(goal);
    }

    private SavingsGoal getOwned(Long id, User user) {
        SavingsGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SavingsGoal", id));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Savings goal does not belong to user");
        }
        return goal;
    }

    private void applyMetadata(SavingsGoal goal, SavingsGoalRequest request) {
        goal.setName(request.getName().trim());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setTargetDate(request.getTargetDate());
        goal.setColor(request.getColor() == null || request.getColor().isBlank()
                ? "#2563eb"
                : request.getColor());
    }

    private SavingsGoalDTO toDTO(SavingsGoal goal) {
        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount()).max(BigDecimal.ZERO);
        BigDecimal percentage = goal.getCurrentAmount()
                .multiply(BigDecimal.valueOf(100))
                .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP)
                .min(BigDecimal.valueOf(100));
        return new SavingsGoalDTO(
                goal.getId(), goal.getName(), goal.getTargetAmount(), goal.getCurrentAmount(),
                remaining, percentage, goal.getTargetDate(), goal.getColor(), goal.isArchived());
    }
}
