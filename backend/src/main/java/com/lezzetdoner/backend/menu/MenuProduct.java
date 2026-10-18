package com.lezzetdoner.backend.menu;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "menu_products")
public class MenuProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private MenuCategory category;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 180, unique = true)
    private String slug;

    @Column(length = 800)
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "sold_out", nullable = false)
    private boolean soldOut = false;

    @Column(nullable = false)
    private boolean featured = false;

    @Column(name = "new_product", nullable = false)
    private boolean newProduct = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public MenuProduct() {
    }

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public MenuCategory getCategory() {
        return category;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public boolean isActive() {
        return active;
    }

    public boolean isSoldOut() {
        return soldOut;
    }

    public boolean isFeatured() {
        return featured;
    }

    public boolean isNewProduct() {
        return newProduct;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setCategory(MenuCategory category) {
        this.category = category;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setSoldOut(boolean soldOut) {
        this.soldOut = soldOut;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public void setNewProduct(boolean newProduct) {
        this.newProduct = newProduct;
    }
}
