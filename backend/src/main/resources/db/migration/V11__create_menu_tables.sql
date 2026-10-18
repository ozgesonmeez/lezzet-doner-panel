CREATE TABLE menu_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL UNIQUE,
    description VARCHAR(500),
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description VARCHAR(800),
    image_url TEXT,
    base_price NUMERIC(10, 2),
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sold_out BOOLEAN NOT NULL DEFAULT FALSE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    new_product BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_menu_product_category
        FOREIGN KEY (category_id)
        REFERENCES menu_categories(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_menu_product_base_price
        CHECK (base_price IS NULL OR base_price >= 0)
);

CREATE TABLE menu_product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    name VARCHAR(120) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_menu_variant_product
        FOREIGN KEY (product_id)
        REFERENCES menu_products(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_menu_variant_price
        CHECK (price >= 0)
);

CREATE INDEX idx_menu_categories_active_sort
    ON menu_categories(active, sort_order);

CREATE INDEX idx_menu_products_category
    ON menu_products(category_id);

CREATE INDEX idx_menu_products_public
    ON menu_products(active, category_id, sort_order);

CREATE INDEX idx_menu_product_variants_product
    ON menu_product_variants(product_id);

CREATE INDEX idx_menu_product_variants_public
    ON menu_product_variants(active, product_id, sort_order);
