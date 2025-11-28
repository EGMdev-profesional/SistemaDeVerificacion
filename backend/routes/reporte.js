import express from 'express';
import {
  getDashboardStats,
  getReporteTardanzas,
  getReporteSalidasTempranas,
  getReporteGeneral,
  getEstadisticasPracticante
} from '../controllers/reporteController.js';
import { verifyToken, isAdmin, isPracticante } from '../middleware/auth.js';

const router = express.Router();

// Dashboard y reportes (solo admin)
router.get('/dashboard', verifyToken, isAdmin, getDashboardStats);
router.get('/tardanzas', verifyToken, isAdmin, getReporteTardanzas);
router.get('/salidas-tempranas', verifyToken, isAdmin, getReporteSalidasTempranas);
router.get('/general', verifyToken, isAdmin, getReporteGeneral);

// Estadísticas del practicante
router.get('/mis-estadisticas', verifyToken, isPracticante, getEstadisticasPracticante);
router.get('/practicante/:id', verifyToken, isAdmin, getEstadisticasPracticante);

export default router;
