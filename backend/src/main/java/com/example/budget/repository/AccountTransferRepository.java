package com.example.budget.repository;

import com.example.budget.model.AccountTransfer;
import com.example.budget.model.FinancialAccount;
import com.example.budget.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AccountTransferRepository extends JpaRepository<AccountTransfer, Long> {
    List<AccountTransfer> findByUserOrderByTransferDateDescIdDesc(User user);
    List<AccountTransfer> findByUserAndTransferDateBetweenOrderByTransferDateAscIdAsc(
            User user, LocalDate start, LocalDate end);
    List<AccountTransfer> findByFromAccountAndTransferDateBetween(
            FinancialAccount account, LocalDate start, LocalDate end);
    List<AccountTransfer> findByToAccountAndTransferDateBetween(
            FinancialAccount account, LocalDate start, LocalDate end);
    List<AccountTransfer> findTop20ByFromAccountAndTransferDateLessThanEqualOrderByTransferDateDescIdDesc(
            FinancialAccount account, LocalDate date);
    List<AccountTransfer> findTop20ByToAccountAndTransferDateLessThanEqualOrderByTransferDateDescIdDesc(
            FinancialAccount account, LocalDate date);

    // Pageable-capped variants of the two queries above, so the account activity
    // feed can page arbitrarily far back instead of being frozen at 20 rows.
    List<AccountTransfer> findByFromAccountAndTransferDateLessThanEqualOrderByTransferDateDescIdDesc(
            FinancialAccount account, LocalDate date, Pageable pageable);
    List<AccountTransfer> findByToAccountAndTransferDateLessThanEqualOrderByTransferDateDescIdDesc(
            FinancialAccount account, LocalDate date, Pageable pageable);
    List<AccountTransfer> findTop20ByFromAccountAndTransferDateGreaterThanOrderByTransferDateAscIdAsc(
            FinancialAccount account, LocalDate date);
    List<AccountTransfer> findTop20ByToAccountAndTransferDateGreaterThanOrderByTransferDateAscIdAsc(
            FinancialAccount account, LocalDate date);
    boolean existsByFromAccountOrToAccount(FinancialAccount from, FinancialAccount to);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM AccountTransfer t WHERE t.user = :user")
    void deleteAllByUser(@Param("user") User user);
}
