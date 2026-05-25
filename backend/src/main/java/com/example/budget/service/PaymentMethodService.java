package com.example.budget.service;

import com.example.budget.dto.PaymentMethodDTO;
import com.example.budget.dto.PaymentMethodRequest;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.mapper.PaymentMethodMapper;
import com.example.budget.model.PaymentMethod;
import com.example.budget.model.PaymentMethodType;
import com.example.budget.model.User;
import com.example.budget.repository.PaymentMethodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentMethodService {

    private final PaymentMethodRepository repository;
    private final PaymentMethodMapper mapper;

    public PaymentMethodService(PaymentMethodRepository repository, PaymentMethodMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<PaymentMethodDTO> findAllByUser(User user) {
        return repository.findByUserOrderByActiveDescNameAsc(user).stream()
                .map(mapper::toDTO)
                .toList();
    }

    /** Returns the user's payment method entities (used for bulk operations like CSV import). */
    @Transactional(readOnly = true)
    public List<PaymentMethod> findEntitiesByUser(User user) {
        return repository.findByUserOrderByActiveDescNameAsc(user);
    }

    @Transactional(readOnly = true)
    public PaymentMethod getOwnedPaymentMethod(Long id, User user) {
        if (id == null) {
            return null;
        }
        return repository.findByIdAndUser(id, user)
                .orElseThrow(() -> new EntityNotFoundException("PaymentMethod", id));
    }

    @Transactional
    public PaymentMethodDTO create(PaymentMethodRequest request, User user) {
        validateCardRules(request);
        return mapper.toDTO(repository.save(mapper.toEntity(request, user)));
    }

    @Transactional
    public PaymentMethodDTO update(Long id, PaymentMethodRequest request, User user) {
        validateCardRules(request);
        PaymentMethod paymentMethod = getOwnedPaymentMethod(id, user);
        mapper.apply(paymentMethod, request);
        return mapper.toDTO(repository.save(paymentMethod));
    }

    @Transactional
    public void delete(Long id, User user) {
        PaymentMethod paymentMethod = getOwnedPaymentMethod(id, user);
        repository.delete(paymentMethod);
    }

    private void validateCardRules(PaymentMethodRequest request) {
        if (PaymentMethodType.CREDIT_CARD.equals(request.getType())) {
            if (request.getStatementClosingDay() == null || request.getPaymentDay() == null) {
                throw new IllegalArgumentException("Credit cards require statementClosingDay and paymentDay");
            }
            return;
        }
        if (request.getStatementClosingDay() != null || request.getPaymentDay() != null) {
            throw new IllegalArgumentException("Statement closing and payment days are only valid for credit cards");
        }
    }
}
