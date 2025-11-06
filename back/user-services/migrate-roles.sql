DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_lock_access' AND column_name='role') THEN
        ALTER TABLE user_lock_access ADD COLUMN role VARCHAR(20) DEFAULT 'guest' 
        CHECK (role IN ('admin', 'user', 'guest'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='user_lock_access' AND column_name='is_admin') THEN
        UPDATE user_lock_access 
        SET role = CASE 
            WHEN is_admin = true THEN 'admin'
            ELSE 'guest'
        END
        WHERE role IS NULL OR role = 'guest';
        
        ALTER TABLE user_lock_access DROP COLUMN IF EXISTS is_admin;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                   WHERE conname = 'user_lock_access_user_email_lock_code_key') THEN
        ALTER TABLE user_lock_access ADD CONSTRAINT user_lock_access_user_email_lock_code_key 
        UNIQUE (user_email, lock_code);
    END IF;
END $$;

SELECT 'Migration completed. Current roles distribution:' as status;
SELECT role, COUNT(*) as count FROM user_lock_access GROUP BY role;

