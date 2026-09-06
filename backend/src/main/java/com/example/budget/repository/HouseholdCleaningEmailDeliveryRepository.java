package com.example.budget.repository;

import com.example.budget.model.HouseholdCleaningAssignment;
import com.example.budget.model.HouseholdCleaningEmailDelivery;
import com.example.budget.model.HouseholdCleaningEmailDeliveryType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HouseholdCleaningEmailDeliveryRepository
        extends JpaRepository<HouseholdCleaningEmailDelivery, Long> {
    boolean existsByAssignmentAndDeliveryType(
            HouseholdCleaningAssignment assignment,
            HouseholdCleaningEmailDeliveryType deliveryType);
}
