CREATE TABLE monthly_extra_expenses (
    id BIGSERIAL PRIMARY KEY,

    description VARCHAR(150) NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    expense_month DATE NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_monthly_extra_expense_amount_positive
        CHECK (amount > 0)
);

CREATE INDEX idx_monthly_extra_expenses_month
    ON monthly_extra_expenses(expense_month);