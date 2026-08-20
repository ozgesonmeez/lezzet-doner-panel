package com.lezzetdoner.backend.monthly.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record MonthlyExtraExpenseResponse(

        Long id,

        String description,

        BigDecimal amount,

        Instant createdAt

) {
}