package com.lezzetdoner.backend.menu.slider;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuSlideRepository extends JpaRepository<MenuSlide, Long> {

    List<MenuSlide> findAllByOrderBySortOrderAscIdAsc();

    List<MenuSlide> findByActiveTrueOrderBySortOrderAscIdAsc();
}
