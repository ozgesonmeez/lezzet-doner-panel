package com.lezzetdoner.backend.dailycash.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateIncomeRequest(

        @NotBlank(message = "Satış kanalı boş bırakılamaz.")
        @Size(
                max = 100,
                message = "Satış kanalı en fazla 100 karakter olabilir."
        )
        String channel,

        @NotNull(message = "Tutar gereklidir.")
        @DecimalMin(
                value = "0.01",
                message = "Tutar 0'dan büyük olmalıdır."
        )
        BigDecimal amount,

        LocalDate entryDate

) {
}