CREATE TABLE menu_slides (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(160),
    description VARCHAR(500),

    desktop_image_url TEXT NOT NULL,
    mobile_image_url TEXT,

    button_text VARCHAR(100),
    button_url VARCHAR(500),

    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_menu_slide_desktop_image
        CHECK (LENGTH(TRIM(desktop_image_url)) > 0)
);

CREATE INDEX idx_menu_slides_active_sort
    ON menu_slides(active, sort_order, id);
