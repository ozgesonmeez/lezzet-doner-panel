package com.lezzetdoner.backend.menu.slider;

import com.lezzetdoner.backend.menu.slider.dto.MenuSlideResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/menu/slides")
public class PublicMenuSlideController {

    private final MenuSlideService service;

    public PublicMenuSlideController(MenuSlideService service) {
        this.service = service;
    }

    @GetMapping
    public List<MenuSlideResponse> getSlides() {
        return service.getPublicSlides();
    }
}
