package com.lezzetdoner.backend.menu.dto;

public record AdminMenuCategoryResponse(
        Long id,
        String name,
        String slug,
        String description,
        int sortOrder,
        boolean active
) {
}
