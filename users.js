const express = require('express');
const pool = require('../database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();
const secretKey = 'supersecretkey';

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.sendStatus(401); 

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
}

router.post('/register', async (req, res) => {
  try {
    const { email, gender, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, gender, password, role) VALUES ($1, $2, $3, $4)', [email, gender, hashedPassword, role]);
    res.sendStatus(201);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal Server Error' }); 
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
    if (user.rows.length > 0) {
      const validPassword = await bcrypt.compare(password, user.rows[0].password);
      if (validPassword) {
        const token = jwt.sign({ email: user.rows[0].email, role: user.rows[0].role }, secretKey, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid Password' }); 
      }
    } else {
      res.status(401).json({ error: 'User Not Found' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  pool.query('SELECT * FROM users OFFSET $1 LIMIT $2', [offset, limit], (error, results) => {
    if (error) {
      throw error;
    }
    res.json(results.rows);
  });

  /**
 * @swagger
 * /users:
 *   get:
 *     summary: Mendapatkan daftar pengguna dengan paginasi
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman yang akan ditampilkan
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah pengguna per halaman
 *     responses:
 *       '200':
 *         description: Berhasil mendapatkan daftar pengguna
 *       '500':
 *         description: Kesalahan server
 */

});


router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Hanya user terdaftar yang bisa mengakses ini!' });
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Mendaftarkan pengguna baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Pengguna berhasil terdaftar
 *       '500':
 *         description: Kesalahan server
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Melakukan login pengguna
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Berhasil login, token diberikan
 *       '401':
 *         description: Email atau kata sandi tidak valid
 *       '500':
 *         description: Kesalahan server
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Mendapatkan daftar pengguna dengan paginasi
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman yang akan ditampilkan
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah pengguna per halaman
 *     responses:
 *       '200':
 *         description: Berhasil mendapatkan daftar pengguna
 *       '500':
 *         description: Kesalahan server
 */

/**
 * @swagger
 * /users/protected:
 *   get:
 *     summary: Rute terlindungi, hanya dapat diakses oleh pengguna terdaftar
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Hanya pengguna terdaftar yang bisa mengakses ini
 *       '401':
 *         description: Unauthorized - Token tidak valid
 *       '500':
 *         description: Kesalahan server
 */


module.exports = router;
