package com.example.budget.service;

import com.example.budget.dto.CreateInstallmentPlanRequest;
import com.example.budget.dto.InstallmentPlanDTO;
import com.example.budget.model.InstallmentPlan;
import com.example.budget.model.Transaction;
import com.example.budget.model.TransactionType;
import com.example.budget.model.User;
import com.example.budget.repository.InstallmentPlanRepository;
import com.example.budget.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InstallmentPlanService {

    private final InstallmentPlanRepository installmentPlanRepository;
    private final TransactionRepository transactionRepository;

    public InstallmentPlanService(InstallmentPlanRepository installmentPlanRepository,
                                  TransactionRepository transactionRepository) {
        this.installmentPlanRepository = installmentPlanRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Cria um plano de parcelamento e gera automaticamente as transações mensais
     */
    @Transactional
    public InstallmentPlanDTO createInstallmentPlan(CreateInstallmentPlanRequest request, User user) {
        // Validações básicas
        if (request.getTotalInstallments() <= 0) {
            throw new IllegalArgumentException("O número de parcelas deve ser maior que zero");
        }
        if (request.getInstallmentValue() == null || request.getInstallmentValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor da parcela deve ser maior que zero");
        }

        // Criar o plano de parcelamento
        InstallmentPlan plan = new InstallmentPlan();
        plan.setTotalInstallments(request.getTotalInstallments());
        plan.setInstallmentValue(request.getInstallmentValue());
        plan.setTotalAmount(request.getInstallmentValue().multiply(new BigDecimal(request.getTotalInstallments())));
        plan.setUser(user);

        // Salvar o plano primeiro para obter o ID
        plan = installmentPlanRepository.save(plan);

        // Criar as transações para cada parcela
        List<Transaction> transactions = new ArrayList<>();
        LocalDate currentDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();

        for (int i = 1; i <= request.getTotalInstallments(); i++) {
            Transaction transaction = new Transaction();
            transaction.setType(TransactionType.EXPENSE); // Parcelamentos são sempre despesas
            transaction.setCategory(request.getCategory());
            transaction.setDescription(String.format("%s (Parcela %d/%d)", 
                                       request.getDescription(), i, request.getTotalInstallments()));
            transaction.setAmount(request.getInstallmentValue());
            transaction.setDateTime(currentDate.atStartOfDay());
            transaction.setUser(user);
            transaction.setInstallmentPlan(plan);
            transaction.setInstallmentNumber(i); // Define o número da parcela

            transactions.add(transaction);
            
            // Incrementar a data em 1 mês para a próxima parcela
            currentDate = currentDate.plusMonths(1);
        }

        // Salvar todas as transações
        transactionRepository.saveAll(transactions);
        plan.setTransactions(transactions);

        // Retornar o DTO com as informações completas
        return mapToDTO(plan);
    }

    /**
     * Busca todos os planos de parcelamento de um usuário
     */
    public List<InstallmentPlanDTO> findAllByUser(User user) {
        List<InstallmentPlan> plans = installmentPlanRepository.findByUserOrderByIdDesc(user);
        return plans.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca um plano específico por ID
     */
    public InstallmentPlanDTO findById(Long id, User user) {
        InstallmentPlan plan = installmentPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plano de parcelamento não encontrado"));

        // Verificar se o plano pertence ao usuário
        if (!plan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Acesso negado");
        }

        return mapToDTO(plan);
    }

    /**
     * Deleta um plano de parcelamento e todas as suas transações associadas
     */
    @Transactional
    public void delete(Long id, User user) {
        InstallmentPlan plan = installmentPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plano de parcelamento não encontrado"));

        // Verificar se o plano pertence ao usuário
        if (!plan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Acesso negado");
        }

        // Devido ao cascade = CascadeType.ALL e orphanRemoval = true, 
        // as transações serão deletadas automaticamente
        installmentPlanRepository.delete(plan);
    }

    /**
     * Converte InstallmentPlan para InstallmentPlanDTO
     */
    private InstallmentPlanDTO mapToDTO(InstallmentPlan plan) {
        List<InstallmentPlanDTO.InstallmentTransactionDTO> transactionDTOs = plan.getTransactions().stream()
                .map(tx -> new InstallmentPlanDTO.InstallmentTransactionDTO(
                        tx.getId(),
                        tx.getDescription(),
                        tx.getAmount(),
                        tx.getCategory(),
                        tx.getDateTime().toLocalDate(),
                        extractInstallmentNumber(tx.getDescription())
                ))
                .collect(Collectors.toList());

        return new InstallmentPlanDTO(
                plan.getId(),
                plan.getTotalInstallments(),
                plan.getTotalAmount(),
                plan.getInstallmentValue(),
                transactionDTOs
        );
    }

    /**
     * Extrai o número da parcela da descrição (ex: "Compra (Parcela 2/3)" -> 2)
     */
    private int extractInstallmentNumber(String description) {
        try {
            // Procura por padrão "Parcela X/Y"
            int start = description.indexOf("Parcela ") + 8;
            int end = description.indexOf("/", start);
            if (start > 7 && end > start) {
                return Integer.parseInt(description.substring(start, end));
            }
        } catch (Exception e) {
            // Se não conseguir extrair, retorna 0
        }
        return 0;
    }
}

