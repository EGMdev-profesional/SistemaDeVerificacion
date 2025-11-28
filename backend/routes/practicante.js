import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
  getAllPracticantes,
  getPracticanteById,
  createPracticante,
  getNextCodigo,
  updatePracticante,
  deletePracticante,
  getMyProfile,
  updateMyProfile,
  getPracticanteByCodigo
} from '../controllers/practicanteController.js';
import { verifyToken, isAdmin, isPracticante } from '../middleware/auth.js';

const router = express.Router();

// Rutas para practicantes (sobre sí mismos)
// Ensure uploads folder exists
const uploadsDir = path.resolve(process.cwd(), 'uploads', 'practicantes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${base}${ext}`);
  }
});

const upload = multer({ storage });

router.get('/me', verifyToken, isPracticante, getMyProfile);
// Accept multipart/form-data with optional file field `foto`
router.put('/me', verifyToken, isPracticante, upload.single('foto'), updateMyProfile);

// Rutas para administradores (gestión de practicantes)
router.get('/', verifyToken, isAdmin, getAllPracticantes);
// Siguiente código disponible
router.get('/next-code', verifyToken, isAdmin, getNextCodigo);
router.get('/codigo/:codigo', verifyToken, isAdmin, getPracticanteByCodigo);
router.get('/:id', verifyToken, isAdmin, getPracticanteById);
router.post('/', verifyToken, isAdmin, createPracticante);
router.put('/:id', verifyToken, isAdmin, updatePracticante);
router.delete('/:id', verifyToken, isAdmin, deletePracticante);

export default router;
