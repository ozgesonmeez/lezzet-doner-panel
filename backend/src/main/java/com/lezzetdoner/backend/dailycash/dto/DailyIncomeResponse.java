package com.lezzetdoner.backend.dailycash.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record DailyIncomeResponse(

        Long id,

        String channel,

        BigDecimal amount,

        LocalDate entryDate,

        Instant createdAt

) {
}