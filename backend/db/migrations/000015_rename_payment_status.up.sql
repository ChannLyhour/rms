DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'status'
    ) THEN
        ALTER TABLE payments RENAME COLUMN status TO payment_status;
    END IF;
END $$;
