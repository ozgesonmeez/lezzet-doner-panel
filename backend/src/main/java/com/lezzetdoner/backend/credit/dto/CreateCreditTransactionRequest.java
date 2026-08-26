package com.lezzetdoner.backend.credit.dto;

import com.lezzetdoner.backend.credit.CreditTransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateCreditTransactionRequest(

        @NotNull(
                message =
                        "İşlem türü gereklidir."
        )
        CreditTransactionType type,

        @NotNull(
                message =
                        "Tutar gereklidir."
        )
        @DecimalMin(
                value = "0.01",
                message =
                        "Tutar 0'dan büyük olmalıdır."
        )
        BigDecimal amount,

        LocalDate transactionDate,

        @Size(
                max = 500,
                message =
                        "Not en fazla 500 karakter olabilir."
        )
        String note

) {
}