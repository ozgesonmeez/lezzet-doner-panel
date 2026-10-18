package com.lezzetdoner.backend.menu.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record MenuProductRequest(
        @NotNull
        Long categoryId,

        @NotBlank
        @Size(max = 160)
        String name,

        @Size(max = 800)
        String description,

        String imageUrl,

        @DecimalMin(value = "0.00")
        BigDecimal basePrice,

        Integer sortOrder,

        Boolean active,

        Boolean soldOut,

        Boolean featured,

        Boolean newProduct,

        List<@Valid MenuVariantRequest> variants
) {
}
