package com.lezzetdoner.backend.menu.image;

public record MenuImageResponse(
        String url,
        String publicId,
        String format,
        Integer width,
        Integer height
) {
}
