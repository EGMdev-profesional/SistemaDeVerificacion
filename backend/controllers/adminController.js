import bcrypt from 'bcrypt';
import db from '../config/database.js';

// Obtener perfil del admin
export const getProfile = async (req, res) => {
  try {
    const [admins] = await db.query(
      'SELECT id, nombre, apellidos, usuario, email, telefono, foto FROM administradores WHERE id = ? AND activo = TRUE',
      [req.user.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    res.json({
      success: true,
      data: admins[0]
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Actualizar perfil del admin
export const updateProfile = async (req, res) => {
  try {
    const { nombre, apellidos, email, telefono, password } = req.body;
    const updates = [];
    const values = [];

    if (nombre) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (apellidos) {
      updates.push('apellidos = ?');
      values.push(apellidos);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (telefono) {
      updates.push('telefono = ?');
      values.push(telefono);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar'
      });
    }

    values.push(req.user.id);

    await db.query(
      `UPDATE administradores SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Listar todos los administradores
export const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await db.query(
      'SELECT id, nombre, apellidos, usuario, email, telefono, foto, activo, fecha_creacion FROM administradores ORDER BY fecha_creacion DESC'
    );

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Error al listar administradores:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Crear nuevo administrador
export const createAdmin = async (req, res) => {
  try {
    const { nombre, apellidos, usuario, password, email, telefono } = req.body;

    if (!nombre || !apellidos || !usuario || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, apellidos, usuario y contraseña son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const [existing] = await db.query(
      'SELECT id FROM administradores WHERE usuario = ?',
      [usuario]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO administradores (nombre, apellidos, usuario, password, email, telefono) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellidos, usuario, hashedPassword, email, telefono]
    );

    res.status(201).json({
      success: true,
      message: 'Administrador creado correctamente',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error al crear administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Actualizar administrador
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, email, telefono, password, activo } = req.body;
    
    const updates = [];
    const values = [];

    if (nombre) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (apellidos) {
      updates.push('apellidos = ?');
      values.push(apellidos);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (telefono !== undefined) {
      updates.push('telefono = ?');
      values.push(telefono);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    if (activo !== undefined) {
      updates.push('activo = ?');
      values.push(activo);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar'
      });
    }

    values.push(id);

    await db.query(
      `UPDATE administradores SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Administrador actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Eliminar administrador
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir que el admin se elimine a sí mismo
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    await db.query('DELETE FROM administradores WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Administrador eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};
