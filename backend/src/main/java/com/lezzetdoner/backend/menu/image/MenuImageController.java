package com.lezzetdoner.backend.menu.image;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/menu/images")
public class MenuImageController {

    private final MenuImageService menuImageService;

    public MenuImageController(MenuImageService menuImageService) {
        this.menuImageService = menuImageService;
    }

    @PostMapping
    public MenuImageResponse upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        requireAdmin(authentication);
        return menuImageService.upload(file);
    }

    private void requireAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Oturum açmanız gerekiyor."
            );
        }

        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
        if (!admin) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bu işlem için yönetici yetkisi gerekiyor."
            );
        }
    }
}
