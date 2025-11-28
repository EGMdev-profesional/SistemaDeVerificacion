import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

export const login = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // Buscar en administradores
    const [admins] = await db.query(
      'SELECT * FROM administradores WHERE usuario = ? AND activo = TRUE',
      [usuario]
    );

    if (admins.length > 0) {
      const admin = admins[0];
      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (isValidPassword) {
        const token = jwt.sign(
          { 
            id: admin.id, 
            usuario: admin.usuario, 
            rol: 'admin',
            nombre: admin.nombre,
            apellidos: admin.apellidos
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          message: 'Login exitoso',
          token,
          user: {
            id: admin.id,
            nombre: admin.nombre,
            apellidos: admin.apellidos,
            usuario: admin.usuario,
            email: admin.email,
            telefono: admin.telefono,
            foto: admin.foto,
            rol: 'admin'
          }
        });
      }
    }

    // Buscar en practicantes
    const [practicantes] = await db.query(
      'SELECT * FROM practicantes WHERE usuario = ? AND activo = TRUE',
      [usuario]
    );

    if (practicantes.length > 0) {
      const practicante = practicantes[0];
      const isValidPassword = await bcrypt.compare(password, practicante.password);

      if (isValidPassword) {
        const token = jwt.sign(
          { 
            id: practicante.id, 
            usuario: practicante.usuario, 
            rol: 'practicante',
            codigo: practicante.codigo,
            nombre: practicante.nombre,
            apellidos: practicante.apellidos
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          message: 'Login exitoso',
          token,
          user: {
            id: practicante.id,
            nombre: practicante.nombre,
            apellidos: practicante.apellidos,
            usuario: practicante.usuario,
            codigo: practicante.codigo,
            documento: practicante.documento,
            email: practicante.email,
            telefono: practicante.telefono,
            foto: practicante.foto,
            rol: 'practicante'
          }
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Usuario o contraseña incorrectos'
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

export const verifyAuth = async (req, res) => {
  try {
    const { id, rol } = req.user;

    if (rol === 'admin') {
      const [admins] = await db.query(
        'SELECT id, nombre, apellidos, usuario, email, telefono, foto FROM administradores WHERE id = ? AND activo = TRUE',
        [id]
      );

      if (admins.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      return res.json({
        success: true,
        user: { ...admins[0], rol: 'admin' }
      });
    } else {
      const [practicantes] = await db.query(
        'SELECT id, nombre, apellidos, usuario, codigo, documento, email, telefono, foto FROM practicantes WHERE id = ? AND activo = TRUE',
        [id]
      );

      if (practicantes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      return res.json({
        success: true,
        user: { ...practicantes[0], rol: 'practicante' }
      });
    }
  } catch (error) {
    console.error('Error en verifyAuth:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};
