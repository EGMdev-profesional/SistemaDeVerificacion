import db from '../config/database.js';

// Registrar asistencia (entrada o salida)
export const registrarAsistencia = async (req, res) => {
  try {
    const { codigo, tipo } = req.body; // tipo: 'entrada' o 'salida'
    const adminId = req.user.id;

    if (!codigo || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Código y tipo son requeridos'
      });
    }

    if (tipo !== 'entrada' && tipo !== 'salida') {
      return res.status(400).json({
        success: false,
        message: 'Tipo debe ser "entrada" o "salida"'
      });
    }

    // Buscar practicante por código
    const [practicantes] = await db.query(
      'SELECT id, nombre, apellidos, codigo FROM practicantes WHERE codigo = ? AND activo = TRUE',
      [codigo]
    );

    if (practicantes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Código QR no válido o practicante inactivo'
      });
    }

    const practicante = practicantes[0];
    const now = new Date();
    const fecha = now.toISOString().split('T')[0];
    const hora = now.toTimeString().split(' ')[0];

    // Verificar si ya marcó este tipo hoy
    const [existente] = await db.query(
      'SELECT id FROM asistencias WHERE practicante_id = ? AND fecha = ? AND tipo = ?',
      [practicante.id, fecha, tipo]
    );

    if (existente.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Ya se registró la ${tipo} de hoy para este practicante`
      });
    }

    // Determinar si es tardanza o salida temprana
    let esTardanza = false;
    let esSalidaTemprana = false;

    const horaEntrada = process.env.HORA_ENTRADA || '08:00:00';
    const horaSalida = process.env.HORA_SALIDA || '13:00:00';

    if (tipo === 'entrada' && hora > horaEntrada) {
      esTardanza = true;
    }

    if (tipo === 'salida' && hora < horaSalida) {
      esSalidaTemprana = true;
    }

    // Registrar asistencia
    const [result] = await db.query(
      'INSERT INTO asistencias (practicante_id, fecha, hora, tipo, es_tardanza, es_salida_temprana, registrado_por) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [practicante.id, fecha, hora, tipo, esTardanza, esSalidaTemprana, adminId]
    );

    res.status(201).json({
      success: true,
      message: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} registrada correctamente`,
      data: {
        id: result.insertId,
        practicante: `${practicante.nombre} ${practicante.apellidos}`,
        codigo: practicante.codigo,
        fecha,
        hora,
        tipo,
        es_tardanza: esTardanza,
        es_salida_temprana: esSalidaTemprana
      }
    });
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Listar todas las asistencias
export const getAllAsistencias = async (req, res) => {
  try {
    const { fecha, practicante_id, tipo } = req.query;
    
    let query = 'SELECT * FROM vista_asistencias WHERE 1=1';
    const params = [];

    if (fecha) {
      query += ' AND fecha = ?';
      params.push(fecha);
    }

    if (practicante_id) {
      query += ' AND practicante_id = ?';
      params.push(practicante_id);
    }

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    query += ' ORDER BY fecha DESC, hora DESC';

    const [asistencias] = await db.query(query, params);

    res.json({
      success: true,
      data: asistencias
    });
  } catch (error) {
    console.error('Error al listar asistencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Obtener asistencias de hoy
export const getAsistenciasHoy = async (req, res) => {
  try {
    const fecha = new Date().toISOString().split('T')[0];

    const [asistencias] = await db.query(
      'SELECT * FROM vista_asistencias WHERE fecha = ? ORDER BY hora DESC',
      [fecha]
    );

    res.json({
      success: true,
      data: asistencias
    });
  } catch (error) {
    console.error('Error al obtener asistencias de hoy:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Obtener historial de asistencias de un practicante
export const getHistorialPracticante = async (req, res) => {
  try {
    const practicanteId = req.user.rol === 'practicante' ? req.user.id : req.params.id;

    const [asistencias] = await db.query(
      'SELECT * FROM vista_asistencias WHERE practicante_id = ? ORDER BY fecha DESC, hora DESC',
      [practicanteId]
    );

    // Calcular estadísticas
    const [stats] = await db.query(
      `SELECT 
        COUNT(DISTINCT CASE WHEN tipo = 'entrada' THEN fecha END) as total_asistencias,
        COUNT(CASE WHEN es_tardanza = TRUE THEN 1 END) as total_tardanzas,
        COUNT(CASE WHEN es_salida_temprana = TRUE THEN 1 END) as total_salidas_tempranas
      FROM asistencias 
      WHERE practicante_id = ?`,
      [practicanteId]
    );

    res.json({
      success: true,
      data: {
        asistencias,
        estadisticas: stats[0]
      }
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Eliminar asistencia
export const deleteAsistencia = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM asistencias WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Asistencia eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};
