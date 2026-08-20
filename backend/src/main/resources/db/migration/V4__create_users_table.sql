CREATE TABLE app_users (
    id BIGSERIAL PRIMARY KEY,

    full_name VARCHAR(120) NOT NULL,

    email VARCHAR(180) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_app_users_email
        UNIQUE (email),

    CONSTRAINT chk_app_users_role
        CHECK (role IN ('ADMIN', 'PAKETCI'))
);

CREATE INDEX idx_app_users_role
    ON app_users(role);

CREATE INDEX idx_app_users_active
    ON app_users(active);