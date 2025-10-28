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
}