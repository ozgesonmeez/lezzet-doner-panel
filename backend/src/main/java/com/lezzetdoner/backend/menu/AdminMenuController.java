package com.lezzetdoner.backend.menu;

import com.lezzetdoner.backend.menu.dto.AdminMenuCategoryResponse;
import com.lezzetdoner.backend.menu.dto.AdminMenuProductResponse;
import com.lezzetdoner.backend.menu.dto.MenuCategoryRequest;
import com.lezzetdoner.backend.menu.dto.MenuProductRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class AdminMenuController {

    private final MenuService menuService;

    public AdminMenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    // =========================================================
    // CATEGORIES
    // =========================================================

    @GetMapping("/categories")
    public List<AdminMenuCategoryResponse> getCategories(
            Authentication authentication
    ) {
        requireAdmin(authentication);

        return menuService.getAdminCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminMenuCategoryResponse createCategory(
            @Valid @RequestBody MenuCategoryRequest request,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        return menuService.createCategory(request);
    }

    @PutMapping("/categories/{categoryId}")
    public AdminMenuCategoryResponse updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody MenuCategoryRequest request,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        return menuService.updateCategory(
                categoryId,
                request
        );
    }

    @DeleteMapping("/categories/{categoryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(
            @PathVariable Long categoryId,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        menuService.deleteCategory(categoryId);
    }

    // =========================================================
    // PRODUCTS
    // =========================================================

    @GetMapping("/products")
    public List<AdminMenuProductResponse> getProducts(
            Authentication authentication
    ) {
        requireAdmin(authentication);

        return menuService.getAdminProducts();
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminMenuProductResponse createProduct(
            @Valid @RequestBody MenuProductRequest request,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        return menuService.createProduct(request);
    }

    @PutMapping("/products/{productId}")
    public AdminMenuProductResponse updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody MenuProductRequest request,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        return menuService.updateProduct(
                productId,
                request
        );
    }

    @DeleteMapping("/products/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        requireAdmin(authentication);

        menuService.deleteProduct(productId);
    }

    // =========================================================
    // SECURITY
    // =========================================================

    private void requireAdmin(
            Authentication authentication
    ) {
        if (
                authentication == null
                        || !authentication.isAuthenticated()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Oturum gerekli."
            );
        }

        boolean admin =
                authentication
                        .getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                "ROLE_ADMIN".equals(
                                        authority.getAuthority()
                                )
                        );

        if (!admin) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bu alana yalnızca yönetici erişebilir."
            );
        }
    }
}
