ALTER TABLE courier_entries
    ADD COLUMN created_by_user_id BIGINT;

ALTER TABLE courier_entries
    ADD CONSTRAINT fk_courier_entries_created_by_user
        FOREIGN KEY (created_by_user_id)
        REFERENCES app_users(id);

CREATE INDEX idx_courier_entries_created_by_user_id
    ON courier_entries(created_by_user_id);