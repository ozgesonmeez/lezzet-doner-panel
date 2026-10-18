package com.lezzetdoner.backend.menu.slider.dto;

import com.lezzetdoner.backend.menu.slider.MenuSlide;

public record MenuSlideResponse(
        Long id,
        String title,
        String description,
        String desktopImageUrl,
        String mobileImageUrl,
        String buttonText,
        String buttonUrl,
        Integer sortOrder,
        Boolean active
) {
    public static MenuSlideResponse from(MenuSlide slide) {
        return new MenuSlideResponse(
                slide.getId(),
                slide.getTitle(),
                slide.getDescription(),
                slide.getDesktopImageUrl(),
                slide.getMobileImageUrl(),
                slide.getButtonText(),
                slide.getButtonUrl(),
                slide.getSortOrder(),
                slide.getActive()
        );
    }
}
