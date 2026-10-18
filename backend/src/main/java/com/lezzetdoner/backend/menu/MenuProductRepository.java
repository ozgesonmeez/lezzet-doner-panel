package com.lezzetdoner.backend.menu;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuProductRepository extends JpaRepository<MenuProduct, Long> {

    List<MenuProduct> findAllByOrderBySortOrderAscNameAsc();

    List<MenuProduct> findByCategoryIdOrderBySortOrderAscNameAsc(Long categoryId);

    List<MenuProduct> findByCategoryIdAndActiveTrueOrderBySortOrderAscNameAsc(Long categoryId);

    Optional<MenuProduct> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
