import db from '../config/database.js';

// Dashboard - Estadísticas generales
export const getDashboardStats = async (req, res) => {
  try {
    const fecha = new Date().toISOString().split('T')[0];

    // Total de practicantes activos
    const [totalPracticantes] = await db.query(
      'SELECT COUNT(*) as total FROM practicantes WHERE activo = TRUE'
    );

    // Practicantes que marcaron hoy
    const [asistenciasHoy] = await db.query(
      'SELECT COUNT(DISTINCT practicante_id) as total FROM asistencias WHERE fecha = ?',
      [fecha]
    );

    // Tardanzas de hoy
    const [tardanzasHoy] = await db.query(
      'SELECT COUNT(*) as total FROM asistencias WHERE fecha = ? AND es_tardanza = TRUE',
      [fecha]
    );

    // Salidas tempranas de hoy
    const [salidasTempranasHoy] = await db.query(
      'SELECT COUNT(*) as total FROM asistencias WHERE fecha = ? AND es_salida_temprana = TRUE',
      [fecha]
    );

    res.json({
      success: true,
      data: {
        total_practicantes: totalPracticantes[0].total,
        asistencias_hoy: asistenciasHoy[0].total,
        tardanzas_hoy: tardanzasHoy[0].total,
        salidas_tempranas_hoy: salidasTempranasHoy[0].total
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Reporte de tardanzas
export const getReporteTardanzas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    let query = `
      SELECT 
        a.*,
        -- traer la hora de salida correspondiente (si existe) del mismo día y practicante
        (SELECT s.hora FROM asistencias s WHERE s.practicante_id = a.practicante_id AND s.fecha = a.fecha AND s.tipo = 'salida' ORDER BY s.hora DESC LIMIT 1) as hora_salida,
        CONCAT(p.nombre, ' ', p.apellidos) as practicante_nombre,
        p.codigo,
        p.documento
      FROM asistencias a
      INNER JOIN practicantes p ON a.practicante_id = p.id
      WHERE a.es_tardanza = TRUE
    `;
    const params = [];

    if (fecha_inicio) {
      query += ' AND a.fecha >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND a.fecha <= ?';
      params.push(fecha_fin);
    }

    query += ' ORDER BY a.fecha DESC, a.hora DESC';

    const [tardanzas] = await db.query(query, params);

    // Resumen por practicante
    const [resumen] = await db.query(
      `SELECT 
        p.id,
        p.codigo,
        CONCAT(p.nombre, ' ', p.apellidos) as nombre_completo,
        COUNT(*) as total_tardanzas
      FROM asistencias a
      INNER JOIN practicantes p ON a.practicante_id = p.id
      WHERE a.es_tardanza = TRUE
      ${fecha_inicio ? 'AND a.fecha >= ?' : ''}
      ${fecha_fin ? 'AND a.fecha <= ?' : ''}
      GROUP BY p.id, p.codigo, p.nombre, p.apellidos
      ORDER BY total_tardanzas DESC`,
      params
    );

    res.json({
      success: true,
      data: {
        tardanzas,
        resumen
      }
    });
  } catch (error) {
    console.error('Error al obtener reporte de tardanzas:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Reporte de salidas tempranas
export const getReporteSalidasTempranas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    let query = `
      SELECT 
        a.*,
        CONCAT(p.nombre, ' ', p.apellidos) as practicante_nombre,
        p.codigo,
        p.documento
      FROM asistencias a
      INNER JOIN practicantes p ON a.practicante_id = p.id
      WHERE a.es_salida_temprana = TRUE
    `;
    const params = [];

    if (fecha_inicio) {
      query += ' AND a.fecha >= ?';
      params.push(fecha_inicio);
    }

    if (fecha_fin) {
      query += ' AND a.fecha <= ?';
      params.push(fecha_fin);
    }

    query += ' ORDER BY a.fecha DESC, a.hora DESC';

    const [salidas] = await db.query(query, params);

    // Resumen por practicante
    const [resumen] = await db.query(
      `SELECT 
        p.id,
        p.codigo,
        CONCAT(p.nombre, ' ', p.apellidos) as nombre_completo,
        COUNT(*) as total_salidas_tempranas
      FROM asistencias a
      INNER JOIN practicantes p ON a.practicante_id = p.id
      WHERE a.es_salida_temprana = TRUE
      ${fecha_inicio ? 'AND a.fecha >= ?' : ''}
      ${fecha_fin ? 'AND a.fecha <= ?' : ''}
      GROUP BY p.id, p.codigo, p.nombre, p.apellidos
      ORDER BY total_salidas_tempranas DESC`,
      params
    );

    res.json({
      success: true,
      data: {
        salidas_tempranas: salidas,
        resumen
      }
    });
  } catch (error) {
    console.error('Error al obtener reporte de salidas tempranas:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Reporte general de asistencias
export const getReporteGeneral = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const params = [];

    let whereClause = '';
    if (fecha_inicio && fecha_fin) {
      whereClause = 'WHERE a.fecha BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }

    const [reporte] = await db.query(
      `SELECT 
        p.id,
        p.codigo,
        CONCAT(p.nombre, ' ', p.apellidos) as nombre_completo,
        p.documento,
        COUNT(DISTINCT CASE WHEN a.tipo = 'entrada' THEN a.fecha END) as dias_asistidos,
        COUNT(CASE WHEN a.es_tardanza = TRUE THEN 1 END) as total_tardanzas,
        COUNT(CASE WHEN a.es_salida_temprana = TRUE THEN 1 END) as total_salidas_tempranas,
        MIN(CASE WHEN a.tipo = 'entrada' THEN a.hora END) as primera_entrada,
        MAX(CASE WHEN a.tipo = 'salida' THEN a.hora END) as ultima_salida
      FROM practicantes p
      LEFT JOIN asistencias a ON p.id = a.practicante_id ${whereClause}
      WHERE p.activo = TRUE
      GROUP BY p.id, p.codigo, p.nombre, p.apellidos, p.documento
      ORDER BY p.codigo ASC`,
      params
    );

    res.json({
      success: true,
      data: reporte
    });
  } catch (error) {
    console.error('Error al obtener reporte general:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Estadísticas por practicante
export const getEstadisticasPracticante = async (req, res) => {
  try {
    const practicanteId = req.user.rol === 'practicante' ? req.user.id : req.params.id;

    const [stats] = await db.query(
      'SELECT * FROM vista_estadisticas_practicantes WHERE id = ?',
      [practicanteId]
    );

    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Practicante no encontrado'
      });
    }

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del practicante:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};
