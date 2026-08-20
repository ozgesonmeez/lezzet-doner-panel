package com.lezzetdoner.backend.monthly.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MonthlyDaySummaryResponse(

        LocalDate date,

        BigDecimal totalIncome,

        BigDecimal totalExpense,

        BigDecimal netAmount

) {
}