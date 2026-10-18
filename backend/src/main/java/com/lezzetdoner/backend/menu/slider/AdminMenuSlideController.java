package com.lezzetdoner.backend.menu.slider;

import com.lezzetdoner.backend.menu.slider.dto.MenuSlideRequest;
import com.lezzetdoner.backend.menu.slider.dto.MenuSlideResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu/slides")
public class AdminMenuSlideController {

    private final MenuSlideService service;

    public AdminMenuSlideController(MenuSlideService service) {
        this.service = service;
    }

    @GetMapping
    public List<MenuSlideResponse> getAll() {
        return service.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MenuSlideResponse create(
            @Valid @RequestBody MenuSlideRequest request
    ) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public MenuSlideResponse update(
            @PathVariable Long id,
            @Valid @RequestBody MenuSlideRequest request
    ) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
