CREATE TABLE menu_uploaded_images (
    id UUID PRIMARY KEY,
    content_type VARCHAR(32) NOT NULL,
    image_bytes BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
