const express = require('express');
const pool = require('../database');

const router = express.Router()


router.post('/', (req, res) => {
    /**
 * @swagger
 * /movies:
 *   post:
 *     summary: Menambahkan film baru
 *     parameters:
 *       - in: body
 *         name: movie
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             genres:
 *               type: string
 *             year:
 *               type: integer
 *     responses:
 *       '201':
 *         description: Film berhasil ditambahkan
 *       '500':
 *         description: Kesalahan server
 */

    const { title, genres, year } = req.body;
    if (!title || !genres || !year) {
      return res.status(400).json({ error: 'Harap masukkan title, genres, dan year' });
    }
  
    pool.query('INSERT INTO movies (title, genres, year) VALUES ($1, $2, $3)', [title, genres, year], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Gagal menambahkan film' });
      }
      res.sendStatus(201);
    });
  });
  
  router.delete('/:id', (req, res) => {
    /**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Menghapus film berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *           description: ID dari film yang akan dihapus
 *     responses:
 *       '200':
 *         description: Film berhasil dihapus
 *       '500':
 *         description: Kesalahan server
 */

    const id = req.params.id;
    pool.query('DELETE FROM movies WHERE id = $1', [id], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Gagal menghapus film' });
      }
      res.sendStatus(200);
    });
  });
  
  router.put('/:id', (req, res) => {
    /**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Memperbarui informasi film berdasarkan ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           format: int64
 *           description: ID dari film yang akan diperbarui
 *       - in: body
 *         name: movie
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             genres:
 *               type: string
 *             year:
 *               type: integer
 *     responses:
 *       '200':
 *         description: Informasi film berhasil diperbarui
 *       '500':
 *         description: Kesalahan server
 */

    const id = req.params.id;
    const { title, genres, year } = req.body;
    if (!title || !genres || !year) {
      return res.status(400).json({ error: 'Harap masukkan title, genres, dan year' });
    }
  
    pool.query('UPDATE movies SET title = $1, genres = $2, year = $3 WHERE id = $4', [title, genres, year, id], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Gagal memperbarui film' });
      }
      res.sendStatus(200);
    });
  });
  

router.get('/', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  pool.query('SELECT * FROM movies OFFSET $1 LIMIT $2', [offset, limit], (error, results) => {
    if (error) {
        console.error('Kesalahan saat mendapatkan daftar film:', error);
        res.sendStatus(500);
        return;
    }
    res.json(results.rows);
  });

  /**
 * @swagger
 * /movies:
 *   get:
 *     summary: Mendapatkan daftar film dengan paginasi
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
 *         description: Jumlah film per halaman
 *     responses:
 *       '200':
 *         description: Berhasil mendapatkan daftar film
 *       '500':
 *         description: Kesalahan server
 */

});


module.exports = router;
