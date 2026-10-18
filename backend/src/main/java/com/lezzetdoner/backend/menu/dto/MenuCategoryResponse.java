package com.lezzetdoner.backend.menu.dto;

import java.util.List;

public record MenuCategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        List<MenuProductResponse> products
) {
}
