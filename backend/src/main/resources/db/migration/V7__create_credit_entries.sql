CREATE TABLE credit_entries (
    id BIGSERIAL PRIMARY KEY,

    customer_name VARCHAR(160) NOT NULL,

    phone VARCHAR(30),

    note VARCHAR(500),

    amount NUMERIC(12, 2) NOT NULL
        CHECK (amount > 0),

    credit_date DATE NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'PAID')),

    paid_at TIMESTAMPTZ,

    created_by_user_id BIGINT
        REFERENCES app_users(id)
        ON DELETE SET NULL,

    paid_by_user_id BIGINT
        REFERENCES app_users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT chk_credit_payment_state
        CHECK (
            (
                status = 'OPEN'
                AND paid_at IS NULL
                AND paid_by_user_id IS NULL
            )
            OR
            (
                status = 'PAID'
                AND paid_at IS NOT NULL
            )
        )
);

CREATE INDEX idx_credit_entries_status
    ON credit_entries(status);

CREATE INDEX idx_credit_entries_credit_date
    ON credit_entries(credit_date);

CREATE INDEX idx_credit_entries_status_credit_date
    ON credit_entries(status, credit_date);