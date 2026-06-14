package com.example.budget.repository;

import com.example.budget.model.CategoryBudget;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, Long> {
    List<CategoryBudget> findByUserOrderByYearAscMonthAscCategoryAsc(User user);

    List<CategoryBudget> findByUserAndYearAndMonthOrderByCategoryAsc(User user, int year, int month);
    Optional<CategoryBudget> findByUserAndCategoryIgnoreCaseAndYearAndMonth(
            User user, String category, int year, int month);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM CategoryBudget b WHERE b.user = :user")
    void deleteAllByUser(@Param("user") User user);
}
