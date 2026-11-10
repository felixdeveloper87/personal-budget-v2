package com.example.budget.paymentmethod.controller;

import com.example.budget.paymentmethod.dto.PaymentMethodDTO;
import com.example.budget.paymentmethod.dto.PaymentMethodRequest;
import com.example.budget.user.model.User;
import com.example.budget.paymentmethod.service.PaymentMethodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {

    private final PaymentMethodService service;

    public PaymentMethodController(PaymentMethodService service) {
        this.service = service;
    }

    @GetMapping
    public List<PaymentMethodDTO> all(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return service.findAllByUser(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentMethodDTO create(@Valid @RequestBody PaymentMethodRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return service.create(request, user);
    }

    @PutMapping("/{id}")
    public PaymentMethodDTO update(
            @PathVariable Long id,
            @Valid @RequestBody PaymentMethodRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        return service.update(id, request, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        service.delete(id, user);
    }
}
