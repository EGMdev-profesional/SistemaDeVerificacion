import express from 'express';
import {
  registrarAsistencia,
  getAllAsistencias,
  getAsistenciasHoy,
  getHistorialPracticante,
  deleteAsistencia
} from '../controllers/asistenciaController.js';
import { verifyToken, isAdmin, isPracticante } from '../middleware/auth.js';

const router = express.Router();

// Registrar asistencia (solo admin)
router.post('/', verifyToken, isAdmin, registrarAsistencia);

// Listar asistencias (solo admin)
router.get('/', verifyToken, isAdmin, getAllAsistencias);
router.get('/hoy', verifyToken, isAdmin, getAsistenciasHoy);

// Historial del practicante
router.get('/mi-historial', verifyToken, isPracticante, getHistorialPracticante);
router.get('/practicante/:id', verifyToken, isAdmin, getHistorialPracticante);

// Eliminar asistencia (solo admin)
router.delete('/:id', verifyToken, isAdmin, deleteAsistencia);

export default router;
