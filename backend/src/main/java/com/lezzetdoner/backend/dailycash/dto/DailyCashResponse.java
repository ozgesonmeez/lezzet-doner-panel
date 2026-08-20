package com.lezzetdoner.backend.dailycash.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DailyCashResponse(

        LocalDate date,

        BigDecimal totalIncome,

        BigDecimal totalExpense,

        BigDecimal netAmount,

        List<DailyIncomeResponse> incomes,

        List<DailyExpenseResponse> expenses

) {
}