package com.example.budget.repository;

import com.example.budget.model.PaymentMethod;
import com.example.budget.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByUserOrderByActiveDescNameAsc(User user);

    Optional<PaymentMethod> findByIdAndUser(Long id, User user);
}
