import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(verifyToken, isAdmin);

// Perfil del admin actual
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// CRUD de administradores
router.get('/', getAllAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

export default router;
