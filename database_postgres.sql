-- Base de datos para Sistema de Asistencia por QR
-- Municipalidad de Piura - Practicantes UCV
-- PostgreSQL Version

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Administradores
CREATE TABLE IF NOT EXISTS administradores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    foto VARCHAR(255) DEFAULT 'default-avatar.png',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Practicantes
CREATE TABLE IF NOT EXISTS practicantes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    foto VARCHAR(255) DEFAULT 'default-avatar.png',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Asistencias
CREATE TABLE IF NOT EXISTS asistencias (
    id SERIAL PRIMARY KEY,
    practicante_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida')),
    es_tardanza BOOLEAN DEFAULT FALSE,
    es_salida_temprana BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    registrado_por INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (practicante_id) REFERENCES practicantes(id) ON DELETE CASCADE,
    FOREIGN KEY (registrado_por) REFERENCES administradores(id) ON DELETE SET NULL
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_practicante_fecha ON asistencias(practicante_id, fecha);
CREATE INDEX IF NOT EXISTS idx_fecha ON asistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_tipo ON asistencias(tipo);
CREATE INDEX IF NOT EXISTS idx_admin_usuario ON administradores(usuario);
CREATE INDEX IF NOT EXISTS idx_practicante_usuario ON practicantes(usuario);

-- Insertar administrador por defecto
-- Contraseña: admin123
INSERT INTO administradores (nombre, apellidos, usuario, password, email, telefono) 
VALUES (
    'Administrador', 
    'Sistema', 
    'admin', 
    '$2b$10$HaOe22txRSSz54.9UcaygexG6HBIc/ddiKCY0BlZz5HLQ/euGSRR.',
    'admin@municipalidad-piura.gob.pe',
    '073-123456'
) ON CONFLICT (usuario) DO NOTHING;

-- Insertar practicantes de ejemplo
-- Contraseña para todos: 123456
INSERT INTO practicantes (nombre, apellidos, documento, telefono, codigo, usuario, password, email) 
VALUES 
(
    'Juan Carlos', 
    'Pérez García', 
    '72345678', 
    '987654321', 
    'PRACT-001', 
    'PRACT-001', 
    '$2b$10$76GcLk/7xA4iIN1.CyfsN.yLIgq2fFz141RzQ6xxTk2/e4Y3TrsYy',
    'juan.perez@ucv.edu.pe'
),
(
    'María Elena', 
    'Rodríguez López', 
    '71234567', 
    '987654322', 
    'PRACT-002', 
    'PRACT-002', 
    '$2b$10$76GcLk/7xA4iIN1.CyfsN.yLIgq2fFz141RzQ6xxTk2/e4Y3TrsYy',
    'maria.rodriguez@ucv.edu.pe'
),
(
    'Carlos Alberto', 
    'Sánchez Díaz', 
    '70123456', 
    '987654323', 
    '987654323', 
    'PRACT-003', 
    'PRACT-003', 
    '$2b$10$76GcLk/7xA4iIN1.CyfsN.yLIgq2fFz141RzQ6xxTk2/e4Y3TrsYy',
    'carlos.sanchez@ucv.edu.pe'
)
ON CONFLICT (usuario) DO NOTHING;

-- Insertar asistencias de ejemplo (últimos 7 días)
INSERT INTO asistencias (practicante_id, fecha, hora, tipo, es_tardanza, registrado_por) 
VALUES 
-- Día 1
(1, CURRENT_DATE - INTERVAL '6 days', '07:55:00', 'entrada', FALSE, 1),
(1, CURRENT_DATE - INTERVAL '6 days', '13:00:00', 'salida', FALSE, 1),
(2, CURRENT_DATE - INTERVAL '6 days', '08:15:00', 'entrada', TRUE, 1),
(2, CURRENT_DATE - INTERVAL '6 days', '13:05:00', 'salida', FALSE, 1),
-- Día 2
(1, CURRENT_DATE - INTERVAL '5 days', '08:00:00', 'entrada', FALSE, 1),
(1, CURRENT_DATE - INTERVAL '5 days', '13:00:00', 'salida', FALSE, 1),
(3, CURRENT_DATE - INTERVAL '5 days', '08:30:00', 'entrada', TRUE, 1),
(3, CURRENT_DATE - INTERVAL '5 days', '12:45:00', 'salida', TRUE, 1),
-- Día 3
(1, CURRENT_DATE - INTERVAL '4 days', '07:58:00', 'entrada', FALSE, 1),
(1, CURRENT_DATE - INTERVAL '4 days', '13:02:00', 'salida', FALSE, 1),
(2, CURRENT_DATE - INTERVAL '4 days', '08:00:00', 'entrada', FALSE, 1),
(2, CURRENT_DATE - INTERVAL '4 days', '13:00:00', 'salida', FALSE, 1),
-- Hoy
(1, CURRENT_DATE, '07:55:00', 'entrada', FALSE, 1),
(2, CURRENT_DATE, '08:10:00', 'entrada', TRUE, 1),
(3, CURRENT_DATE, '08:25:00', 'entrada', TRUE, 1)
ON CONFLICT DO NOTHING;

-- Vista de asistencias con información del practicante
CREATE OR REPLACE VIEW vista_asistencias AS
SELECT 
    a.id,
    a.fecha,
    a.hora,
    a.tipo,
    a.es_tardanza,
    a.es_salida_temprana,
    p.id as practicante_id,
    p.codigo,
    CONCAT(p.nombre, ' ', p.apellidos) as practicante_nombre,
    p.documento,
    p.foto,
    adm.usuario as registrado_por_usuario
FROM asistencias a
INNER JOIN practicantes p ON a.practicante_id = p.id
LEFT JOIN administradores adm ON a.registrado_por = adm.id
ORDER BY a.fecha DESC, a.hora DESC;

-- Vista de estadísticas por practicante
CREATE OR REPLACE VIEW vista_estadisticas_practicantes AS
SELECT 
    p.id,
    p.codigo,
    CONCAT(p.nombre, ' ', p.apellidos) as nombre_completo,
    p.documento,
    p.foto,
    COUNT(DISTINCT CASE WHEN a.tipo = 'entrada' THEN a.fecha END) as total_asistencias,
    COUNT(CASE WHEN a.es_tardanza = TRUE THEN 1 END) as total_tardanzas,
    COUNT(CASE WHEN a.es_salida_temprana = TRUE THEN 1 END) as total_salidas_tempranas
FROM practicantes p
LEFT JOIN asistencias a ON p.id = a.practicante_id
WHERE p.activo = TRUE
GROUP BY p.id, p.codigo, p.nombre, p.apellidos, p.documento, p.foto;

-- Migración: Agregar campos adicionales a practicantes
ALTER TABLE practicantes
  ADD COLUMN IF NOT EXISTS horario JSONB NULL,
  ADD COLUMN IF NOT EXISTS periodo_inicio DATE NULL,
  ADD COLUMN IF NOT EXISTS periodo_fin DATE NULL;

-- Asegurar que codigo sea único
ALTER TABLE practicantes ADD CONSTRAINT IF NOT EXISTS unique_codigo UNIQUE (codigo);
