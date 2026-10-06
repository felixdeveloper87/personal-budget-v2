package com.example.budget.repository;

import com.example.budget.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByUserId(Long userId);

    Optional<PushSubscription> findByEndpoint(String endpoint);

    @Modifying
    @Transactional
    @Query("DELETE FROM PushSubscription subscription WHERE subscription.endpoint = :endpoint")
    int deleteByEndpoint(@Param("endpoint") String endpoint);

    @Modifying
    @Transactional
    @Query("""
            DELETE FROM PushSubscription subscription
            WHERE subscription.endpoint = :endpoint
              AND subscription.userId = :userId
            """)
    int deleteByEndpointAndUserId(@Param("endpoint") String endpoint, @Param("userId") Long userId);
}
