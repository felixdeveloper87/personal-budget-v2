package com.example.budget.validator;

import com.example.budget.exception.AccessDeniedException;
import com.example.budget.exception.EntityNotFoundException;
import com.example.budget.model.Transaction;
import com.example.budget.model.User;
import org.springframework.stereotype.Component;

/**
 * Classe responsável por validações de negócio relacionadas a Transaction.
 * Centraliza todas as regras de validação para facilitar manutenção e testes.
 */
@Component
public class TransactionValidator {
    
    /**
     * Valida se a transação existe e lança exceção caso contrário.
     */
    public void validateTransactionExists(Transaction transaction, Long transactionId) {
        if (transaction == null) {
            throw new EntityNotFoundException("Transaction", transactionId);
        }
    }
    
    /**
     * Valida se o usuário tem permissão para acessar/modificar a transação.
     * Lança AccessDeniedException se o usuário não for o dono da transação.
     * 
     * @param transaction Transação a ser validada
     * @param user Usuário que está tentando acessar a transação
     * @throws IllegalArgumentException se transaction ou user forem null
     * @throws IllegalStateException se a transação não tiver usuário associado (estado inválido)
     * @throws AccessDeniedException se o usuário não for o dono da transação
     */
    public void validateUserOwnership(Transaction transaction, User user) {
        if (transaction == null || user == null) {
            throw new IllegalArgumentException("Transaction and User cannot be null");
        }
        
        // Validação defensiva: verifica se a transação tem usuário associado
        if (transaction.getUser() == null) {
            throw new IllegalStateException("Transaction does not have an associated user");
        }
        
        if (user.getId() == null) {
            throw new IllegalStateException("User ID cannot be null");
        }
        
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: Transaction does not belong to user");
        }
    }
    
    /**
     * Valida se a transação existe e se o usuário tem permissão.
     * Método combinado para facilitar uso comum.
     */
    public void validateTransactionAccess(Transaction transaction, Long transactionId, User user) {
        validateTransactionExists(transaction, transactionId);
        validateUserOwnership(transaction, user);
    }
}

