package com.lezzetdoner.backend.credit.dto;

import java.math.BigDecimal;
import java.util.List;

public record CreditCustomerListResponse(

        BigDecimal totalOpenAmount,

        long customerCount,

        long debtorCount,

        List<CreditCustomerSummaryResponse>
                customers

) {
}