package com.lezzetdoner.backend.menu;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {

    List<MenuCategory> findAllByOrderBySortOrderAscNameAsc();

    List<MenuCategory> findByActiveTrueOrderBySortOrderAscNameAsc();

    Optional<MenuCategory> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
