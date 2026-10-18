package com.lezzetdoner.backend.menu.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminMenuProductResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String name,
        String slug,
        String description,
        String imageUrl,
        BigDecimal basePrice,
        int sortOrder,
        boolean active,
        boolean soldOut,
        boolean featured,
        boolean newProduct,
        List<AdminMenuVariantResponse> variants
) {
}
