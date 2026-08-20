CREATE TABLE couriers (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_couriers_name UNIQUE (name)
);


CREATE TABLE courier_entries (
    id BIGSERIAL PRIMARY KEY,

    courier_id BIGINT NOT NULL,

    amount NUMERIC(12, 2) NOT NULL,

    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_courier_entries_courier
        FOREIGN KEY (courier_id)
        REFERENCES couriers(id),

    CONSTRAINT chk_courier_entries_amount_positive
        CHECK (amount > 0)
);


CREATE INDEX idx_courier_entries_courier_id
    ON courier_entries(courier_id);


CREATE INDEX idx_courier_entries_entry_date
    ON courier_entries(entry_date);


CREATE INDEX idx_courier_entries_courier_date
    ON courier_entries(courier_id, entry_date);