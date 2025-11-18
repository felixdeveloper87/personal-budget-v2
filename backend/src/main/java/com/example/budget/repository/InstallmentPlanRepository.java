package com.example.budget.repository;

import com.example.budget.model.InstallmentPlan;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository interface for InstallmentPlan entity operations.
 * 
 * Provides data access methods for installment plan queries, including
 * user-specific queries with various ordering options.
 */
public interface InstallmentPlanRepository extends JpaRepository<InstallmentPlan, Long> {
    
    /**
     * Finds all installment plans belonging to a specific user.
     * 
     * @param user User to find plans for
     * @return List of installment plans belonging to the user
     */
    List<InstallmentPlan> findByUser(User user);
    
    /**
     * Finds all installment plans belonging to a specific user, ordered by ID in descending order.
     * 
     * Returns plans with the newest first (highest ID first).
     * 
     * @param user User to find plans for
     * @return List of installment plans ordered by ID descending
     */
    List<InstallmentPlan> findByUserOrderByIdDesc(User user);
}

