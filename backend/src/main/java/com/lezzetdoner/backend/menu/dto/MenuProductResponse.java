package com.lezzetdoner.backend.menu.dto;

import java.math.BigDecimal;
import java.util.List;

public record MenuProductResponse(
        Long id,
        String name,
        String slug,
        String description,
        String imageUrl,
        BigDecimal basePrice,
        boolean soldOut,
        boolean featured,
        boolean newProduct,
        List<MenuVariantResponse> variants
) {
}
