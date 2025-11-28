-- Base de datos para Sistema de Asistencia por QR
-- Municipalidad de Piura - Practicantes UCV

CREATE DATABASE IF NOT EXISTS asistencia_qr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE asistencia_qr;

-- Tabla de Administradores
CREATE TABLE administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    foto VARCHAR(255) DEFAULT 'default-avatar.png',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Practicantes
CREATE TABLE practicantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Asistencias
CREATE TABLE asistencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    practicante_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo ENUM('entrada', 'salida') NOT NULL,
    es_tardanza BOOLEAN DEFAULT FALSE,
    es_salida_temprana BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    registrado_por INT, -- ID del admin que escaneó
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (practicante_id) REFERENCES practicantes(id) ON DELETE CASCADE,
    FOREIGN KEY (registrado_por) REFERENCES administradores(id) ON DELETE SET NULL,
    INDEX idx_practicante_fecha (practicante_id, fecha),
    INDEX idx_fecha (fecha),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar administrador por defecto
-- Contraseña: admin123
INSERT INTO administradores (nombre, apellidos, usuario, password, email, telefono) 
VALUES (
    'Administrador', 
    'Sistema', 
    'admin', 
    '$2b$10$rZ5YhkqGvJKqVZ5YhkqGvOXKJ5YhkqGvJKqVZ5YhkqGvJKqVZ5Yhk',
    'admin@municipalidad-piura.gob.pe',
    '073-123456'
);

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
    '$2b$10$rZ5YhkqGvJKqVZ5YhkqGvOXKJ5YhkqGvJKqVZ5YhkqGvJKqVZ5Yhk',
    'juan.perez@ucv.edu.pe'
),
(
    'María Elena', 
    'Rodríguez López', 
    '71234567', 
    '987654322', 
    'PRACT-002', 
    'PRACT-002', 
    '$2b$10$rZ5YhkqGvJKqVZ5YhkqGvOXKJ5YhkqGvJKqVZ5YhkqGvJKqVZ5Yhk',
    'maria.rodriguez@ucv.edu.pe'
),
(
    'Carlos Alberto', 
    'Sánchez Díaz', 
    '70123456', 
    '987654323', 
    'PRACT-003', 
    'PRACT-003', 
    '$2b$10$rZ5YhkqGvJKqVZ5YhkqGvOXKJ5YhkqGvJKqVZ5YhkqGvJKqVZ5Yhk',
    'carlos.sanchez@ucv.edu.pe'
);

-- Insertar asistencias de ejemplo (últimos 7 días)
INSERT INTO asistencias (practicante_id, fecha, hora, tipo, es_tardanza, registrado_por) 
VALUES 
-- Día 1
(1, CURDATE() - INTERVAL 6 DAY, '07:55:00', 'entrada', FALSE, 1),
(1, CURDATE() - INTERVAL 6 DAY, '13:00:00', 'salida', FALSE, 1),
(2, CURDATE() - INTERVAL 6 DAY, '08:15:00', 'entrada', TRUE, 1),
(2, CURDATE() - INTERVAL 6 DAY, '13:05:00', 'salida', FALSE, 1),
-- Día 2
(1, CURDATE() - INTERVAL 5 DAY, '08:00:00', 'entrada', FALSE, 1),
(1, CURDATE() - INTERVAL 5 DAY, '13:00:00', 'salida', FALSE, 1),
(3, CURDATE() - INTERVAL 5 DAY, '08:30:00', 'entrada', TRUE, 1),
(3, CURDATE() - INTERVAL 5 DAY, '12:45:00', 'salida', TRUE, 1),
-- Día 3
(1, CURDATE() - INTERVAL 4 DAY, '07:58:00', 'entrada', FALSE, 1),
(1, CURDATE() - INTERVAL 4 DAY, '13:02:00', 'salida', FALSE, 1),
(2, CURDATE() - INTERVAL 4 DAY, '08:00:00', 'entrada', FALSE, 1),
(2, CURDATE() - INTERVAL 4 DAY, '13:00:00', 'salida', FALSE, 1),
-- Hoy
(1, CURDATE(), '07:55:00', 'entrada', FALSE, 1),
(2, CURDATE(), '08:10:00', 'entrada', TRUE, 1),
(3, CURDATE(), '08:25:00', 'entrada', TRUE, 1);

-- Vistas útiles para reportes

-- Vista de asistencias con información del practicante
CREATE VIEW vista_asistencias AS
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
CREATE VIEW vista_estadisticas_practicantes AS
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
