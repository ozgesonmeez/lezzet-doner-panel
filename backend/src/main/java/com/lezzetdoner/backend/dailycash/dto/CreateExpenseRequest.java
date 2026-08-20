package com.lezzetdoner.backend.dailycash.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateExpenseRequest(

        @NotBlank(message = "Gider açıklaması boş bırakılamaz.")
        @Size(
                max = 150,
                message = "Gider açıklaması en fazla 150 karakter olabilir."
        )
        String description,

        @NotNull(message = "Tutar gereklidir.")
        @DecimalMin(
                value = "0.01",
                message = "Tutar 0'dan büyük olmalıdır."
        )
        BigDecimal amount

) {
}