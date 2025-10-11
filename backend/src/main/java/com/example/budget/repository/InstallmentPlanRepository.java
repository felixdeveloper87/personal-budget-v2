package com.example.budget.repository;

import com.example.budget.model.InstallmentPlan;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InstallmentPlanRepository extends JpaRepository<InstallmentPlan, Long> {
    
    List<InstallmentPlan> findByUser(User user);
    
    List<InstallmentPlan> findByUserOrderByIdDesc(User user);
}

