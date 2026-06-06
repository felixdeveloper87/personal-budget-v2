package com.example.budget.repository;

import com.example.budget.model.FinancialAccount;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FinancialAccountRepository extends JpaRepository<FinancialAccount, Long> {
    List<FinancialAccount> findByUserOrderByActiveDescNameAsc(User user);
    List<FinancialAccount> findByUserAndActiveTrueOrderByNameAsc(User user);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM FinancialAccount a WHERE a.user = :user")
    void deleteAllByUser(@Param("user") User user);
}
