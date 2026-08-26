package com.lezzetdoner.backend.credit.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CreditCustomerDetailResponse(

        Long id,

        String customerName,

        String phone,

        String note,

        BigDecimal balance,

        Long createdByUserId,

        String createdByName,

        Instant createdAt,

        List<CreditTransactionResponse>
                transactions

) {
}