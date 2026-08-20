package com.lezzetdoner.backend.courier.dto;

import java.math.BigDecimal;
import java.util.List;

public record CourierResponse(

        Long id,

        String name,

        boolean active,

        int packageCount,

        BigDecimal totalAmount,

        List<CourierEntryResponse> entries

) {
}