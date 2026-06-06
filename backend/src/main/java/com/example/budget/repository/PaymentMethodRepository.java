package com.example.budget.repository;

import com.example.budget.model.PaymentMethod;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByUserOrderByActiveDescNameAsc(User user);

    Optional<PaymentMethod> findByIdAndUser(Long id, User user);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM PaymentMethod m WHERE m.user = :user")
    void deleteAllByUser(@Param("user") User user);
}
