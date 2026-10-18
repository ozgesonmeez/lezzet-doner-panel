package com.lezzetdoner.backend.menu.slider;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "menu_slides")
public class MenuSlide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 160)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "desktop_image_url", nullable = false)
    private String desktopImageUrl;

    @Column(name = "mobile_image_url")
    private String mobileImageUrl;

    @Column(name = "button_text", length = 100)
    private String buttonText;

    @Column(name = "button_url", length = 500)
    private String buttonUrl;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDesktopImageUrl() { return desktopImageUrl; }
    public void setDesktopImageUrl(String desktopImageUrl) { this.desktopImageUrl = desktopImageUrl; }

    public String getMobileImageUrl() { return mobileImageUrl; }
    public void setMobileImageUrl(String mobileImageUrl) { this.mobileImageUrl = mobileImageUrl; }

    public String getButtonText() { return buttonText; }
    public void setButtonText(String buttonText) { this.buttonText = buttonText; }

    public String getButtonUrl() { return buttonUrl; }
    public void setButtonUrl(String buttonUrl) { this.buttonUrl = buttonUrl; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
