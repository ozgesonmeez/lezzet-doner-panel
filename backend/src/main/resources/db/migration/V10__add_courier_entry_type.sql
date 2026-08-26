ALTER TABLE courier_entries
    ADD COLUMN entry_type VARCHAR(20)
    NOT NULL
    DEFAULT 'NORMAL';

DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'courier_entries'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%amount%'
    LOOP
        EXECUTE format(
            'ALTER TABLE courier_entries DROP CONSTRAINT %I',
            constraint_record.conname
        );
    END LOOP;
END
$$;

ALTER TABLE courier_entries
    ADD CONSTRAINT chk_courier_entries_entry_type
    CHECK (
        entry_type IN (
            'NORMAL',
            'ONLINE'
        )
    );

ALTER TABLE courier_entries
    ADD CONSTRAINT chk_courier_entries_amount_type
    CHECK (
        (
            entry_type = 'NORMAL'
            AND amount > 0
        )
        OR
        (
            entry_type = 'ONLINE'
            AND amount = 0
        )
    );