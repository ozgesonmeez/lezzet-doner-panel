CREATE TABLE daily_income_entries (
    id BIGSERIAL PRIMARY KEY,

    channel VARCHAR(100) NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_daily_income_amount_positive
        CHECK (amount > 0)
);


CREATE TABLE daily_expense_entries (
    id BIGSERIAL PRIMARY KEY,

    description VARCHAR(150) NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_daily_expense_amount_positive
        CHECK (amount > 0)
);


CREATE INDEX idx_daily_income_entry_date
    ON daily_income_entries(entry_date);


CREATE INDEX idx_daily_expense_entry_date
    ON daily_expense_entries(entry_date);