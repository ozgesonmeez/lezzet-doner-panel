package com.lezzetdoner.backend.menu.dto;

import java.math.BigDecimal;

public record MenuVariantResponse(
        Long id,
        String name,
        BigDecimal price
) {
}
