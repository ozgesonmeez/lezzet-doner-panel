package com.lezzetdoner.backend.menu;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuProductVariantRepository extends JpaRepository<MenuProductVariant, Long> {

    List<MenuProductVariant> findByProductIdOrderBySortOrderAscNameAsc(Long productId);

    List<MenuProductVariant> findByProductIdAndActiveTrueOrderBySortOrderAscNameAsc(Long productId);

    void deleteByProductId(Long productId);
}
