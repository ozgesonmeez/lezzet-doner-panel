package com.lezzetdoner.backend.courier.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record CourierEntryResponse(

        Long id,

        BigDecimal amount,

        LocalDate entryDate,

        String entryType,

        Instant createdAt,

        Long createdByUserId,

        String createdByName,

        String createdByRole

) {
}