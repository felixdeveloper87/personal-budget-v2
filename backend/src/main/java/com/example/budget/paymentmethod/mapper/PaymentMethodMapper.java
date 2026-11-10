package com.example.budget.paymentmethod.mapper;

import com.example.budget.paymentmethod.dto.PaymentMethodDTO;
import com.example.budget.paymentmethod.dto.PaymentMethodRequest;
import com.example.budget.paymentmethod.model.PaymentMethod;
import com.example.budget.paymentmethod.model.PaymentMethodType;
import com.example.budget.user.model.User;
import org.springframework.stereotype.Component;

@Component
public class PaymentMethodMapper {

    public PaymentMethod toEntity(PaymentMethodRequest request, User user) {
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setUser(user);
        apply(paymentMethod, request);
        return paymentMethod;
    }

    public void apply(PaymentMethod paymentMethod, PaymentMethodRequest request) {
        paymentMethod.setName(request.getName().trim());
        paymentMethod.setType(request.getType());
        paymentMethod.setIssuer(request.getIssuer() == null || request.getIssuer().isBlank()
                ? null
                : request.getIssuer().trim());
        paymentMethod.setActive(request.isActive());

        if (PaymentMethodType.CREDIT_CARD.equals(request.getType())) {
            paymentMethod.setStatementClosingDay(request.getStatementClosingDay());
            paymentMethod.setPaymentDay(request.getPaymentDay());
            paymentMethod.setCreditLimit(request.getCreditLimit());
        } else {
            paymentMethod.setStatementClosingDay(null);
            paymentMethod.setPaymentDay(null);
            paymentMethod.setCreditLimit(null);
        }
        // The settlement account is resolved (with ownership check) in the service.
    }

    public PaymentMethodDTO toDTO(PaymentMethod paymentMethod) {
        return new PaymentMethodDTO(
                paymentMethod.getId(),
                paymentMethod.getName(),
                paymentMethod.getType(),
                paymentMethod.getIssuer(),
                paymentMethod.isActive(),
                paymentMethod.getStatementClosingDay(),
                paymentMethod.getPaymentDay(),
                paymentMethod.getCreditLimit(),
                paymentMethod.getSettlementAccount() != null ? paymentMethod.getSettlementAccount().getId() : null,
                paymentMethod.getSettlementAccount() != null ? paymentMethod.getSettlementAccount().getName() : null,
                paymentMethod.getCreatedAt(),
                paymentMethod.getUpdatedAt()
        );
    }
}
