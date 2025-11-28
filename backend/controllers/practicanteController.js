import bcrypt from 'bcrypt';
import db from '../config/database.js';

// Listar todos los practicantes
export const getAllPracticantes = async (req, res) => {
  try {
    const [practicantes] = await db.query(
      'SELECT id, nombre, apellidos, documento, telefono, codigo, usuario, email, foto, activo, fecha_creacion, horario, periodo_inicio, periodo_fin FROM practicantes ORDER BY codigo ASC'
    );

    res.json({
      success: true,
      data: practicantes
    });
  } catch (error) {
    console.error('Error al listar practicantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Obtener el siguiente código disponible (ej: PRACT-0001)
export const getNextCodigo = async (req, res) => {
  try {
    // Tomamos la parte numérica del código y obtenemos el máximo
    const [rows] = await db.query(
      "SELECT MAX(CAST(SUBSTRING_INDEX(codigo, '-', -1) AS UNSIGNED)) as maxNum FROM practicantes WHERE codigo LIKE 'PRACT-%'"
    );

    let next = 1;
    if (rows && rows.length > 0 && rows[0].maxNum) {
      next = rows[0].maxNum + 1;
    }

    // Formatear con 4 dígitos: PRACT-0001
    const padded = String(next).padStart(4, '0');
    const codigo = `PRACT-${padded}`;

    res.json({ success: true, data: { codigo } });
  } catch (error) {
    console.error('Error al obtener siguiente código:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
  }
};

// Obtener un practicante por ID
export const getPracticanteById = async (req, res) => {
  try {
    const { id } = req.params;

    const [practicantes] = await db.query(
      'SELECT id, nombre, apellidos, documento, telefono, codigo, usuario, email, foto, activo, horario, periodo_inicio, periodo_fin FROM practicantes WHERE id = ?',
      [id]
    );

    if (practicantes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Practicante no encontrado'
      });
    }

    res.json({
      success: true,
      data: practicantes[0]
    });
  } catch (error) {
    console.error('Error al obtener practicante:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Crear nuevo practicante
export const createPracticante = async (req, res) => {
  try {
    const { nombre, apellidos, documento, telefono, email, horario, periodo_inicio, periodo_fin } = req.body;

    if (!nombre || !apellidos || !documento) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, apellidos y documento son requeridos'
      });
    }

    // Verificar si el documento ya existe
    const [existingDoc] = await db.query(
      'SELECT id FROM practicantes WHERE documento = ?',
      [documento]
    );

    if (existingDoc.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El documento ya existe'
      });
    }
    // Generar el siguiente código en servidor (evita edición/race)
    const [rows] = await db.query(
      "SELECT MAX(CAST(SUBSTRING_INDEX(codigo, '-', -1) AS UNSIGNED)) as maxNum FROM practicantes WHERE codigo LIKE 'PRACT-%'"
    );

    let next = 1;
    if (rows && rows.length > 0 && rows[0].maxNum) next = rows[0].maxNum + 1;
    const padded = String(next).padStart(4, '0');
    const codigoGenerado = `PRACT-${padded}`;

    // El usuario será el mismo que el código generado
    const usuario = codigoGenerado;
    // Contraseña por defecto: 123456
    const defaultPassword = '123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // horario puede venir como objeto; lo guardamos como JSON o NULL
    const horarioJson = horario ? JSON.stringify(horario) : null;

    const [result] = await db.query(
      'INSERT INTO practicantes (nombre, apellidos, documento, telefono, codigo, usuario, password, email, horario, periodo_inicio, periodo_fin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellidos, documento, telefono, codigoGenerado, usuario, hashedPassword, email, horarioJson, periodo_inicio || null, periodo_fin || null]
    );

    res.status(201).json({
      success: true,
      message: 'Practicante creado correctamente',
      data: { 
        id: result.insertId,
        usuario: usuario,
        password_default: defaultPassword
      }
    });
  } catch (error) {
    console.error('Error al crear practicante:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Actualizar practicante
export const updatePracticante = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, documento, telefono, codigo, email, password, activo, horario, periodo_inicio, periodo_fin } = req.body;
    
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
    if (documento) {
      // Verificar que el documento no esté en uso por otro practicante
      const [existing] = await db.query(
        'SELECT id FROM practicantes WHERE documento = ? AND id != ?',
        [documento, id]
      );
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El documento ya está en uso'
        });
      }
      updates.push('documento = ?');
      values.push(documento);
    }
    if (telefono !== undefined) {
      updates.push('telefono = ?');
      values.push(telefono);
    }
    if (horario !== undefined) {
      // guardar como JSON o NULL
      updates.push('horario = ?');
      values.push(horario ? JSON.stringify(horario) : null);
    }
    if (periodo_inicio !== undefined) {
      updates.push('periodo_inicio = ?');
      values.push(periodo_inicio || null);
    }
    if (periodo_fin !== undefined) {
      updates.push('periodo_fin = ?');
      values.push(periodo_fin || null);
    }
    if (codigo) {
      // Verificar que el código no esté en uso por otro practicante
      const [existing] = await db.query(
        'SELECT id FROM practicantes WHERE codigo = ? AND id != ?',
        [codigo, id]
      );
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El código ya está en uso'
        });
      }
      updates.push('codigo = ?');
      values.push(codigo);
      updates.push('usuario = ?');
      values.push(codigo);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
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
      `UPDATE practicantes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Practicante actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar practicante:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Eliminar practicante
export const deletePracticante = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM practicantes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Practicante eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar practicante:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Obtener perfil del practicante (para el propio practicante)
export const getMyProfile = async (req, res) => {
  try {
    const [practicantes] = await db.query(
      'SELECT id, nombre, apellidos, documento, telefono, codigo, usuario, email, foto, horario, periodo_inicio, periodo_fin FROM practicantes WHERE id = ? AND activo = TRUE',
      [req.user.id]
    );

    if (practicantes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Practicante no encontrado'
      });
    }

    res.json({
      success: true,
      data: practicantes[0]
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

// Actualizar perfil del practicante (para el propio practicante)
export const updateMyProfile = async (req, res) => {
  try {
    // When using multipart/form-data, multer populates req.body and req.file
    const { nombre, apellidos, telefono, email, password } = req.body;
    const file = req.file;
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
    if (telefono !== undefined) {
      updates.push('telefono = ?');
      values.push(telefono);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    // If a photo file was uploaded, save path to DB (relative path under /uploads/practicantes)
    if (file) {
      // store filename relative to uploads/practicantes
      const fotoPath = `practicantes/${file.filename}`;
      updates.push('foto = ?');
      values.push(fotoPath);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar'
      });
    }

    values.push(req.user.id);

    await db.query(
      `UPDATE practicantes SET ${updates.join(', ')} WHERE id = ?`,
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

// Buscar practicante por código QR
export const getPracticanteByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const [practicantes] = await db.query(
      'SELECT id, nombre, apellidos, documento, codigo, foto, horario, periodo_inicio, periodo_fin FROM practicantes WHERE codigo = ? AND activo = TRUE',
      [codigo]
    );

    if (practicantes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Practicante no encontrado'
      });
    }

    res.json({
      success: true,
      data: practicantes[0]
    });
  } catch (error) {
    console.error('Error al buscar practicante:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};
