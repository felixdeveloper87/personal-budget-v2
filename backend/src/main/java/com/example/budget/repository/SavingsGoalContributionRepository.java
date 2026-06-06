package com.example.budget.repository;

import com.example.budget.model.SavingsGoalContribution;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SavingsGoalContributionRepository extends JpaRepository<SavingsGoalContribution, Long> {

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM SavingsGoalContribution c WHERE c.goal.user = :user")
    void deleteAllByUser(@Param("user") User user);
}
