-- Simplified FitApp schema for admin-only mode
-- Only admin role and admin user remain; todas las demás tablas y roles quedan removidos.
-- NOTE: Run a full backup before applying to production. MySQL DDL is not fully transactional.

CREATE DATABASE IF NOT EXISTS fitapp_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fitapp_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS v_users_con_rol;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users: only admin users are allowed in this simplified schema
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  role_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  telefono VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
  INDEX idx_users_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE OR REPLACE VIEW v_users_con_rol AS
SELECT u.id, u.nombre, u.email, u.telefono, u.activo,
  r.nombre AS rol, u.created_at, u.updated_at
FROM users u
JOIN roles r ON r.id = u.role_id;

INSERT INTO roles (id, nombre, descripcion) VALUES
  (1, 'admin', 'Acceso total al sistema')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

INSERT INTO users (id, role_id, nombre, email, password_hash, activo)
VALUES
  (1, 1, 'Administrador FitApp', 'admin@fitapp.com', '$2b$10$BCtRlMB5T/vcf2t9twxSDu50MVir8gf3jhLcamCbYR2oi.hXfgW/a', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), role_id = VALUES(role_id), email = VALUES(email), password_hash = VALUES(password_hash), activo = VALUES(activo);


-- Demo profiles
INSERT INTO coach_profiles (user_id, especialidad, biografia)
    VALUES (2, 'Fuerza e Hipertrofia', 'Certificado en acondicionamiento físico con más de 8 años de experiencia.')
ON DUPLICATE KEY UPDATE especialidad = VALUES(especialidad);

INSERT INTO client_profiles (user_id, coach_id, peso_kg, altura_cm, objetivo, objetivo_calorico_kcal)
    VALUES (3, 2, 78.50, 175.00, 'Ganancia de masa muscular y acondicionamiento general', 2500)
ON DUPLICATE KEY UPDATE coach_id = VALUES(coach_id);

INSERT INTO nutritionist_profiles (user_id, especialidad)
    VALUES (4, 'Nutrición Deportiva y Metabolismo Clínico')
ON DUPLICATE KEY UPDATE especialidad = VALUES(especialidad);
