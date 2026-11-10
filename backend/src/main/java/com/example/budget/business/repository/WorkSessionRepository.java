package com.example.budget.business.repository;

import com.example.budget.business.model.WorkSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkSessionRepository extends JpaRepository<WorkSession, Long> {
    Optional<WorkSession> findFirstByUserIdAndEndedAtIsNull(Long userId);

    Optional<WorkSession> findByIdAndUserId(Long id, Long userId);

    List<WorkSession> findByUserIdAndWorkDateBetweenOrderByStartedAtDesc(
            Long userId, LocalDate from, LocalDate to);
}
