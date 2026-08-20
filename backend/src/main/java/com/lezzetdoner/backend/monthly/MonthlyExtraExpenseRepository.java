package com.lezzetdoner.backend.monthly;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MonthlyExtraExpenseRepository
        extends JpaRepository<MonthlyExtraExpense, Long> {

    List<MonthlyExtraExpense>
    findByExpenseMonthOrderByCreatedAtAsc(
            LocalDate expenseMonth
    );

    List<MonthlyExtraExpense>
    findByExpenseMonthBetweenOrderByExpenseMonthAscCreatedAtAsc(
            LocalDate startMonth,
            LocalDate endMonth
    );
}