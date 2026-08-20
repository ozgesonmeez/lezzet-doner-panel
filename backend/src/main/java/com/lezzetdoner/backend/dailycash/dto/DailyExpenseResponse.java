package com.lezzetdoner.backend.dailycash.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record DailyExpenseResponse(

        Long id,

        String description,

        BigDecimal amount,

        LocalDate entryDate,

        Instant createdAt

) {
}