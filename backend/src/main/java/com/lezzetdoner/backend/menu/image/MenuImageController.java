package com.lezzetdoner.backend.menu.image;

import com.lezzetdoner.backend.user.AppUser;
import com.lezzetdoner.backend.user.AppUserRepository;
import com.lezzetdoner.backend.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/menu/images")
public class MenuImageController {

    private final MenuImageService menuImageService;
    private final AppUserRepository appUserRepository;

    public MenuImageController(
            MenuImageService menuImageService,
            AppUserRepository appUserRepository
    ) {
        this.menuImageService = menuImageService;
        this.appUserRepository = appUserRepository;
    }

    @PostMapping
    public MenuImageResponse upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        requireAdmin(authentication);
        return menuImageService.upload(file);
    }

    private AppUser requireAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Oturum açmanız gerekiyor."
            );
        }

        AppUser user = appUserRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Kullanıcı bulunamadı."
                ));

        if (!user.isActive() || user.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bu işlem için yönetici yetkisi gerekiyor."
            );
        }

        return user;
    }
}
