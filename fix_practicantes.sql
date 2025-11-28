-- Script para corregir contraseñas de PRACTICANTES
-- Hash generado y PROBADO para la contraseña "123456"
-- Ejecutar en phpMyAdmin

USE asistencia_qr;

UPDATE practicantes 
SET password = '$2b$10$msliPYGDWcZr/W505.SfL.Mtripw2o4E0PdgA6J.cMuohR451yia.'
WHERE codigo IN ('PRACT-001', 'PRACT-002', 'PRACT-003');

SELECT 'Contraseñas de practicantes actualizadas correctamente' as mensaje;
