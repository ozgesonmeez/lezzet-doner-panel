package com.lezzetdoner.backend.credit.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record CreditTransactionResponse(

        Long id,

        String type,

        BigDecimal amount,

        LocalDate transactionDate,

        String note,

        Long createdByUserId,

        String createdByName,

        Instant createdAt

) {
}