package com.lezzetdoner.backend.menu.slider;

import com.lezzetdoner.backend.menu.slider.dto.MenuSlideRequest;
import com.lezzetdoner.backend.menu.slider.dto.MenuSlideResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MenuSlideService {

    private final MenuSlideRepository repository;

    public MenuSlideService(MenuSlideRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<MenuSlideResponse> getAll() {
        return repository.findAllByOrderBySortOrderAscIdAsc()
                .stream()
                .map(MenuSlideResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MenuSlideResponse> getPublicSlides() {
        return repository.findByActiveTrueOrderBySortOrderAscIdAsc()
                .stream()
                .map(MenuSlideResponse::from)
                .toList();
    }

    @Transactional
    public MenuSlideResponse create(MenuSlideRequest request) {
        MenuSlide slide = new MenuSlide();
        applyRequest(slide, request);
        return MenuSlideResponse.from(repository.save(slide));
    }

    @Transactional
    public MenuSlideResponse update(Long id, MenuSlideRequest request) {
        MenuSlide slide = findSlide(id);
        applyRequest(slide, request);
        return MenuSlideResponse.from(repository.save(slide));
    }

    @Transactional
    public void delete(Long id) {
        MenuSlide slide = findSlide(id);
        repository.delete(slide);
    }

    private MenuSlide findSlide(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Slider bulunamadı."
                ));
    }

    private void applyRequest(MenuSlide slide, MenuSlideRequest request) {
        String desktopUrl = request.desktopImageUrl().trim();

        if (!desktopUrl.startsWith("https://")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Görsel adresi HTTPS olmalıdır."
            );
        }

        slide.setTitle(request.title());
        slide.setDescription(request.description());
        slide.setDesktopImageUrl(desktopUrl);

        String mobileUrl = request.mobileImageUrl();
        if (mobileUrl != null && !mobileUrl.isBlank()) {
            mobileUrl = mobileUrl.trim();
            if (!mobileUrl.startsWith("https://")) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Mobil görsel adresi HTTPS olmalıdır."
                );
            }
        } else {
            mobileUrl =

            mobileUrl = null;
        }

        slide.setMobileImageUrl(mobileUrl);
        slide.setButtonText(request.buttonText());

        String buttonUrl = request.buttonUrl();

        if (buttonUrl != null && !buttonUrl.isBlank()) {
            buttonUrl = buttonUrl.trim();

            if (!buttonUrl.equals("/menu")
                    && !buttonUrl.startsWith("/menu#")
                    && !buttonUrl.startsWith("/menu/")) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Buton yalnızca QR menüye yönlendirebilir."
                );
            }
        } else {
            buttonUrl = null;
        }

        slide.setButtonUrl(buttonUrl);
        slide.setSortOrder(
                request.sortOrder() != null ? request.sortOrder() : 0
        );
        slide.setActive(
                request.active() != null ? request.active() : true
        );
    }
}
