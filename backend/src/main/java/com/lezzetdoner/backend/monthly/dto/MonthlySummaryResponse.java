package com.lezzetdoner.backend.monthly.dto;

import java.math.BigDecimal;
import java.util.List;

public record MonthlySummaryResponse(

        String month,

        BigDecimal totalIncome,

        BigDecimal dailyExpenseTotal,

        BigDecimal extraExpenseTotal,

        BigDecimal totalExpense,

        BigDecimal netAmount,

        List<MonthlyDaySummaryResponse> days,

        List<MonthlyExtraExpenseResponse> extraExpenses

) {
}