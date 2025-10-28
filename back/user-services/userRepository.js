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

    async createUser({ name, email, password_hash, profile_image = null}) {
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

    
}