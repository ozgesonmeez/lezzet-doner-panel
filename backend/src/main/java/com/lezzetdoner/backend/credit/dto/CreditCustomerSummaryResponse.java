package com.lezzetdoner.backend.credit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreditCustomerSummaryResponse(

        Long id,

        String customerName,

        String phone,

        String note,

        BigDecimal balance,

        LocalDate lastTransactionDate,

        long transactionCount

) {
}