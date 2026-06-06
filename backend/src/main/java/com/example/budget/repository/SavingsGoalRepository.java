package com.example.budget.repository;

import com.example.budget.model.SavingsGoal;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {
    List<SavingsGoal> findByUserOrderByArchivedAscTargetDateAscIdDesc(User user);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM SavingsGoal g WHERE g.user = :user")
    void deleteAllByUser(@Param("user") User user);
}
