package com.lezzetdoner.backend.menu;

import com.lezzetdoner.backend.menu.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class MenuService {

    private final MenuCategoryRepository categoryRepository;
    private final MenuProductRepository productRepository;
    private final MenuProductVariantRepository variantRepository;

    public MenuService(
            MenuCategoryRepository categoryRepository,
            MenuProductRepository productRepository,
            MenuProductVariantRepository variantRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    // =========================================================
    // PUBLIC MENU
    // =========================================================

    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> getPublicMenu() {
        return categoryRepository
                .findByActiveTrueOrderBySortOrderAscNameAsc()
                .stream()
                .map(this::toPublicCategoryResponse)
                .toList();
    }

    private MenuCategoryResponse toPublicCategoryResponse(
            MenuCategory category
    ) {
        List<MenuProductResponse> products =
                productRepository
                        .findByCategoryIdAndActiveTrueOrderBySortOrderAscNameAsc(
                                category.getId()
                        )
                        .stream()
                        .map(this::toPublicProductResponse)
                        .toList();

        return new MenuCategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                products
        );
    }

    private MenuProductResponse toPublicProductResponse(
            MenuProduct product
    ) {
        List<MenuVariantResponse> variants =
                variantRepository
                        .findByProductIdAndActiveTrueOrderBySortOrderAscNameAsc(
                                product.getId()
                        )
                        .stream()
                        .map(variant ->
                                new MenuVariantResponse(
                                        variant.getId(),
                                        variant.getName(),
                                        variant.getPrice()
                                )
                        )
                        .toList();

        return new MenuProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getImageUrl(),
                product.getBasePrice(),
                product.isSoldOut(),
                product.isFeatured(),
                product.isNewProduct(),
                variants
        );
    }

    // =========================================================
    // ADMIN - CATEGORIES
    // =========================================================

    @Transactional(readOnly = true)
    public List<AdminMenuCategoryResponse> getAdminCategories() {
        return categoryRepository
                .findAllByOrderBySortOrderAscNameAsc()
                .stream()
                .map(this::toAdminCategoryResponse)
                .toList();
    }

    @Transactional
    public AdminMenuCategoryResponse createCategory(
            MenuCategoryRequest request
    ) {
        String name = normalizeRequired(request.name());
        String slug = createUniqueCategorySlug(name, null);

        MenuCategory category = new MenuCategory();

        category.setName(name);
        category.setSlug(slug);
        category.setDescription(
                normalizeOptional(request.description())
        );
        category.setSortOrder(
                request.sortOrder() != null
                        ? request.sortOrder()
                        : 0
        );
        category.setActive(
                request.active() == null
                        || request.active()
        );

        return toAdminCategoryResponse(
                categoryRepository.save(category)
        );
    }

    @Transactional
    public AdminMenuCategoryResponse updateCategory(
            Long categoryId,
            MenuCategoryRequest request
    ) {
        MenuCategory category =
                getCategoryOrThrow(categoryId);

        String name = normalizeRequired(request.name());

        category.setName(name);
        category.setSlug(
                createUniqueCategorySlug(
                        name,
                        category.getId()
                )
        );
        category.setDescription(
                normalizeOptional(request.description())
        );

        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }

        if (request.active() != null) {
            category.setActive(request.active());
        }

        return toAdminCategoryResponse(
                categoryRepository.save(category)
        );
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        MenuCategory category =
                getCategoryOrThrow(categoryId);

        List<MenuProduct> products =
                productRepository
                        .findByCategoryIdOrderBySortOrderAscNameAsc(
                                categoryId
                        );

        if (!products.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bu kategoride ürün bulunduğu için kategori silinemez."
            );
        }

        categoryRepository.delete(category);
    }

    // =========================================================
    // ADMIN - PRODUCTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AdminMenuProductResponse> getAdminProducts() {
        return productRepository
                .findAllByOrderBySortOrderAscNameAsc()
                .stream()
                .map(this::toAdminProductResponse)
                .toList();
    }

    @Transactional
    public AdminMenuProductResponse createProduct(
            MenuProductRequest request
    ) {
        MenuCategory category =
                getCategoryOrThrow(request.categoryId());

        validateProductPrice(request);

        String name = normalizeRequired(request.name());

        MenuProduct product = new MenuProduct();

        product.setCategory(category);
        product.setName(name);
        product.setSlug(
                createUniqueProductSlug(name, null)
        );
        product.setDescription(
                normalizeOptional(request.description())
        );
        product.setImageUrl(
                normalizeOptional(request.imageUrl())
        );
        product.setBasePrice(request.basePrice());
        product.setSortOrder(
                request.sortOrder() != null
                        ? request.sortOrder()
                        : 0
        );
        product.setActive(
                request.active() == null
                        || request.active()
        );
        product.setSoldOut(
                request.soldOut() != null
                        && request.soldOut()
        );
        product.setFeatured(
                request.featured() != null
                        && request.featured()
        );
        product.setNewProduct(
                request.newProduct() != null
                        && request.newProduct()
        );

        MenuProduct saved =
                productRepository.save(product);

        saveVariants(
                saved,
                request.variants()
        );

        return toAdminProductResponse(saved);
    }

    @Transactional
    public AdminMenuProductResponse updateProduct(
            Long productId,
            MenuProductRequest request
    ) {
        MenuProduct product =
                getProductOrThrow(productId);

        MenuCategory category =
                getCategoryOrThrow(request.categoryId());

        validateProductPrice(request);

        String name = normalizeRequired(request.name());

        product.setCategory(category);
        product.setName(name);
        product.setSlug(
                createUniqueProductSlug(
                        name,
                        product.getId()
                )
        );
        product.setDescription(
                normalizeOptional(request.description())
        );
        product.setImageUrl(
                normalizeOptional(request.imageUrl())
        );
        product.setBasePrice(request.basePrice());

        if (request.sortOrder() != null) {
            product.setSortOrder(request.sortOrder());
        }

        if (request.active() != null) {
            product.setActive(request.active());
        }

        if (request.soldOut() != null) {
            product.setSoldOut(request.soldOut());
        }

        if (request.featured() != null) {
            product.setFeatured(request.featured());
        }

        if (request.newProduct() != null) {
            product.setNewProduct(request.newProduct());
        }

        MenuProduct saved =
                productRepository.save(product);

        variantRepository.deleteByProductId(productId);

        saveVariants(
                saved,
                request.variants()
        );

        return toAdminProductResponse(saved);
    }

    @Transactional
    public void deleteProduct(Long productId) {
        MenuProduct product =
                getProductOrThrow(productId);

        variantRepository.deleteByProductId(productId);
        productRepository.delete(product);
    }

    // =========================================================
    // VARIANTS
    // =========================================================

    private void saveVariants(
            MenuProduct product,
            List<MenuVariantRequest> requests
    ) {
        if (requests == null || requests.isEmpty()) {
            return;
        }

        for (MenuVariantRequest request : requests) {

            MenuProductVariant variant =
                    new MenuProductVariant();

            variant.setProduct(product);
            variant.setName(
                    normalizeRequired(request.name())
            );
            variant.setPrice(request.price());
            variant.setSortOrder(
                    request.sortOrder() != null
                            ? request.sortOrder()
                            : 0
            );
            variant.setActive(
                    request.active() == null
                            || request.active()
            );

            variantRepository.save(variant);
        }
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateProductPrice(
            MenuProductRequest request
    ) {
        boolean hasBasePrice =
                request.basePrice() != null;

        boolean hasVariants =
                request.variants() != null
                        && !request.variants().isEmpty();

        if (!hasBasePrice && !hasVariants) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ürün için fiyat veya en az bir varyant girilmelidir."
            );
        }
    }

    // =========================================================
    // FIND HELPERS
    // =========================================================

    private MenuCategory getCategoryOrThrow(
            Long categoryId
    ) {
        return categoryRepository
                .findById(categoryId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Menü kategorisi bulunamadı."
                        )
                );
    }

    private MenuProduct getProductOrThrow(
            Long productId
    ) {
        return productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Menü ürünü bulunamadı."
                        )
                );
    }

    // =========================================================
    // RESPONSES
    // =========================================================

    private AdminMenuCategoryResponse toAdminCategoryResponse(
            MenuCategory category
    ) {
        return new AdminMenuCategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getSortOrder(),
                category.isActive()
        );
    }

    private AdminMenuProductResponse toAdminProductResponse(
            MenuProduct product
    ) {
        List<AdminMenuVariantResponse> variants =
                variantRepository
                        .findByProductIdOrderBySortOrderAscNameAsc(
                                product.getId()
                        )
                        .stream()
                        .map(variant ->
                                new AdminMenuVariantResponse(
                                        variant.getId(),
                                        variant.getName(),
                                        variant.getPrice(),
                                        variant.getSortOrder(),
                                        variant.isActive()
                                )
                        )
                        .toList();

        return new AdminMenuProductResponse(
                product.getId(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getImageUrl(),
                product.getBasePrice(),
                product.getSortOrder(),
                product.isActive(),
                product.isSoldOut(),
                product.isFeatured(),
                product.isNewProduct(),
                variants
        );
    }

    // =========================================================
    // SLUG
    // =========================================================

    private String createUniqueCategorySlug(
            String name,
            Long currentId
    ) {
        String base = slugify(name);
        String candidate = base;
        int suffix = 2;

        while (true) {
            var existing =
                    categoryRepository.findBySlug(candidate);

            if (existing.isEmpty()
                    || existing.get().getId().equals(currentId)) {
                return candidate;
            }

            candidate = base + "-" + suffix;
            suffix++;
        }
    }

    private String createUniqueProductSlug(
            String name,
            Long currentId
    ) {
        String base = slugify(name);
        String candidate = base;
        int suffix = 2;

        while (true) {
            var existing =
                    productRepository.findBySlug(candidate);

            if (existing.isEmpty()
                    || existing.get().getId().equals(currentId)) {
                return candidate;
            }

            candidate = base + "-" + suffix;
            suffix++;
        }
    }

    private String slugify(String value) {
        String normalized =
                Normalizer.normalize(
                        value,
                        Normalizer.Form.NFD
                )
                .replaceAll("\\p{M}", "");

        normalized = normalized
                .replace("ı", "i")
                .replace("İ", "i")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");

        if (normalized.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Geçerli bir ürün veya kategori adı girilmelidir."
            );
        }

        return normalized;
    }

    // =========================================================
    // NORMALIZATION
    // =========================================================

    private String normalizeRequired(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Zorunlu alan boş bırakılamaz."
            );
        }

        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        return normalized.isEmpty()
                ? null
                : normalized;
    }
}
