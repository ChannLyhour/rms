DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE payments RENAME COLUMN payment_status TO status;
    END IF;
END $$;
