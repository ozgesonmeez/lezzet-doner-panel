package com.lezzetdoner.backend.courier.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateCourierEntryRequest(

        @NotNull(message = "Paket tutarı gereklidir.")
        @DecimalMin(
                value = "0.01",
                message = "Paket tutarı 0'dan büyük olmalıdır."
        )
        BigDecimal amount

) {
}