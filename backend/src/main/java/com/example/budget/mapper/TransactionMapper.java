package com.example.budget.mapper;

import com.example.budget.dto.CreateTransactionRequest;
import com.example.budget.dto.TransactionSearchDTO;
import com.example.budget.dto.UpdateTransactionRequest;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TransactionMapper {

    // ===========================================================
    // ENTITY → DTO
    // ===========================================================
    public TransactionSearchDTO toSearchDTO(Transaction t) {
        if (t == null) return null;

        Long installmentPlanId =
                (t.getInstallmentPlan() != null) ? t.getInstallmentPlan().getId() : null;

        return new TransactionSearchDTO(
                t.getId(),
                t.getDescription(),
                t.getType(),
                t.getCategory(),
                t.getAmount(),
                t.getDateTime().toLocalDate(),
                installmentPlanId
        );
    }

    public List<TransactionSearchDTO> toSearchDTOList(List<Transaction> list) {
        return list.stream().map(this::toSearchDTO).toList();
    }

    // ===========================================================
    // DTO → ENTITY (CREATE)
    // ===========================================================
    public Transaction toEntity(CreateTransactionRequest req, User user) {
        Transaction t = new Transaction();
        t.setDateTime(req.getDateTime());
        t.setType(req.getType());
        t.setCategory(req.getCategory());
        t.setDescription(req.getDescription());
        t.setAmount(req.getAmount());
        t.setUser(user);
        return t;
    }

    // ===========================================================
    // UPDATE ENTITY (IN-PLACE)
    // ===========================================================
    public void updateTransaction(Transaction t, UpdateTransactionRequest req) {
        t.setDateTime(req.getDateTime());
        t.setType(req.getType());
        t.setCategory(req.getCategory());
        t.setDescription(req.getDescription());
        t.setAmount(req.getAmount());
        // campos protegidos permanecem intocados
    }
}
