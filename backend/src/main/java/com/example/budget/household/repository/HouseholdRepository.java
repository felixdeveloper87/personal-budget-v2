package com.example.budget.household.repository;

import com.example.budget.household.model.Household;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HouseholdRepository extends JpaRepository<Household, Long> {
}

