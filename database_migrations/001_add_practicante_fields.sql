-- Migration: Add horario (JSON) and periodo (DATE) fields to practicantes
-- Run this in your MySQL (phpMyAdmin or CLI)

ALTER TABLE practicantes
  ADD COLUMN horario JSON NULL,
  ADD COLUMN periodo_inicio DATE NULL,
  ADD COLUMN periodo_fin DATE NULL;

-- Optional: ensure codigo is unique (recommended)
-- ALTER TABLE practicantes ADD UNIQUE (codigo);
