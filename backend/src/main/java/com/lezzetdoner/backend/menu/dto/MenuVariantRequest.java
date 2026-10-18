package com.lezzetdoner.backend.menu.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record MenuVariantRequest(
        @NotBlank
        @Size(max = 120)
        String name,

        @NotNull
        @DecimalMin(value = "0.00")
        BigDecimal price,

        Integer sortOrder,

        Boolean active
) {
}
