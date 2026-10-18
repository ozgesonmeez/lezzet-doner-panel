package com.lezzetdoner.backend.menu.slider.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MenuSlideRequest(
        @Size(max = 160) String title,
        @Size(max = 500) String description,
        @NotBlank String desktopImageUrl,
        String mobileImageUrl,
        @Size(max = 100) String buttonText,
        @Size(max = 500) String buttonUrl,
        Integer sortOrder,
        Boolean active
) {}
