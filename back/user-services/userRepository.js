const pool = require('./db');

class UserRepository {
    async findByEmail(email) {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    async emailExists(email) {
        try {
            const result = await pool.query(
                'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
                [email]
            );
            return result.rows[0].exists;
        } catch (error) {
            console.error('Error checking email existance: ', error);
            throw error;
        }
    }

    async createUser({ name, email, password_hash, profile_image = null }) {
        try {
            const result = await pool.query(
                'INSERT INTO users (name, email, password_hash, profile_image) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, email, password_hash, profile_image]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating user: ', error);
            throw error;
        }
    }

    async updateUser(email, updates) {
        try {
            const setClause = [];
            const values = [];
            let paramCount = 1;

            Object.keys(updates).forEach(key => {
                if (updates[key] !== undefined) {
                    setClause.push(`${key} = $${paramCount}`);
                    values.push(updates[key]);
                    paramCount++;
                }
            });

            if (setClause.length === 0) {
                throw new Error('No fields to update')
            }

            values.push(email);
            const query = `UPDATE users SET ${setClause.join(', ')} WHERE email = $${paramCount} RETURNING *`;
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating user: ', error);
            throw error;
        }
    }

    async deleteUser(email) {
        try {
            const result = await pool.query(
                'DELETE FROM users WHERE email = $1 RETURNING *',
                [email]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting user: ', error);
            throw error;
        }
    }

    async updateEmail(oldEmail, newEmail) {
        try {
            await pool.query('BEGIN');

            await pool.query(
                'UPDATE users SET email = $1 WHERE email =$2',
                [newEmail, oldEmail]
            );

            await pool.query(
                'UPDATE user_lock_access SET user_email = $1 WHERE user_email = $2',
                [newEmail, oldEmail]
            );

            await pool.query('COMMIT');
            return true;
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error updating email: ', error);
            throw error;
        }
    }

    async findUsersByCode(code) {
        try {
            const result = await pool.query(
                `SELECT u.name, u.email, u.profile_image, 
                CASE WHEN ula.is_admin THEN true ELSE false END as is_admin
         FROM users u
         JOIN user_lock_access ula ON u.email = ula.user_email
         WHERE ula.lock_code = $1`,
                [code]
            );
            return result.rows;
        } catch (error) {
            console.error('Error finding users by code:', error);
            throw error;
        }
    }

    async addAdminCodeToUser(email, registrationCode) {
        try {
            const result = await pool.query(
                'INSERT INTO user_lock_access (user_email, lock_code, is_admin) VALUES ($1, $2, true) ON CONFLICT DO NOTHING RETURNING *',
                [email, registrationCode]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error adding admin code to user:', error);
            throw error;
        }
    }


    async addNonAdminCodeToUser(email, registrationCode) {
        try {
            const result = await pool.query(
                'INSERT INTO user_lock_access (user_email, lock_code, is_admin) VALUES ($1, $2, false) ON CONFLICT DO NOTHING RETURNING *',
                [email, registrationCode]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error adding non-admin code to user:', error);
            throw error;
        }
    }

    async removeCodeFromUser(email, registrationCode) {
        try {
            const result = await pool.query(
                'DELETE FROM user_lock_access WHERE user_email = $1 AND lock_code = $2 RETURNING *',
                [email, registrationCode]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error removing code from user:', error);
            throw error;
        }
    }

    async getAll() {
        try {
            const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
            return result.rows;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

}

module.exports = new UserRepository();