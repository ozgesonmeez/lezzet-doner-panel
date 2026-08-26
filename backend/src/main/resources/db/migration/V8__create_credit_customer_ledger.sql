CREATE TABLE credit_customers (
    id BIGSERIAL PRIMARY KEY,

    customer_name VARCHAR(160) NOT NULL,

    phone VARCHAR(30),

    note VARCHAR(500),

    created_by_user_id BIGINT
        REFERENCES app_users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_credit_customers_name
    ON credit_customers (
        LOWER(customer_name)
    );


CREATE TABLE credit_transactions (
    id BIGSERIAL PRIMARY KEY,

    customer_id BIGINT NOT NULL
        REFERENCES credit_customers(id)
        ON DELETE RESTRICT,

    transaction_type VARCHAR(20) NOT NULL
        CHECK (
            transaction_type IN (
                'CREDIT',
                'PAYMENT'
            )
        ),

    amount NUMERIC(12, 2) NOT NULL
        CHECK (amount > 0),

    transaction_date DATE NOT NULL,

    note VARCHAR(500),

    created_by_user_id BIGINT
        REFERENCES app_users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_credit_transactions_customer
    ON credit_transactions(customer_id);

CREATE INDEX idx_credit_transactions_customer_date
    ON credit_transactions(
        customer_id,
        transaction_date DESC,
        created_at DESC
    );

CREATE INDEX idx_credit_transactions_date
    ON credit_transactions(transaction_date);