package com.lezzetdoner.backend.menu.dto;

import java.math.BigDecimal;

public record AdminMenuVariantResponse(
        Long id,
        String name,
        BigDecimal price,
        int sortOrder,
        boolean active
) {
}
