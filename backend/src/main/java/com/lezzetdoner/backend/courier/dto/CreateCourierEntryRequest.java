package com.lezzetdoner.backend.courier.dto;

import com.lezzetdoner.backend.courier.CourierEntryType;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateCourierEntryRequest(

        @NotNull(
                message =
                        "Paket tutarı gereklidir."
        )
        BigDecimal amount,

        LocalDate entryDate,

        CourierEntryType entryType

) {
}