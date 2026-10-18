package com.lezzetdoner.backend.menu;

import com.lezzetdoner.backend.menu.dto.MenuCategoryResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/menu")
public class PublicMenuController {

    private final MenuService menuService;

    public PublicMenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public List<MenuCategoryResponse> getMenu() {
        return menuService.getPublicMenu();
    }
}
