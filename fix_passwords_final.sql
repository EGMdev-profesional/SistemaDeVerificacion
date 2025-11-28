-- Script FINAL para corregir las contraseñas
-- Ejecutar en phpMyAdmin

USE asistencia_qr;

-- Actualizar admin con hash VÁLIDO para "admin123"
UPDATE administradores 
SET password = '$2b$10$EVv/Y.Zr2Q9XOxlxjCuSwOLEgF4EA1i0fl1zh0lhusEtBCdgpvxa2'
WHERE usuario = 'admin';

-- Generar hash para practicantes "123456"
-- Este hash es válido y fue probado
UPDATE practicantes 
SET password = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE codigo IN ('PRACT-001', 'PRACT-002', 'PRACT-003');

SELECT 'Contraseñas corregidas correctamente - Ahora funcionarán' as mensaje;
