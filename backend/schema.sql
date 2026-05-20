CREATE DATABASE IF NOT EXISTS fitapp_db
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fitapp_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS v_food_logs_detalle;
DROP VIEW IF EXISTS v_progress_resumen;
DROP VIEW IF EXISTS v_users_con_rol;
DROP TABLE IF EXISTS routine_exercises;
DROP TABLE IF EXISTS routines;
DROP TABLE IF EXISTS progress_records;
DROP TABLE IF EXISTS food_logs;
DROP TABLE IF EXISTS coach_profiles;
DROP TABLE IF EXISTS client_profiles;
DROP TABLE IF EXISTS nutritionist_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS payments;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
    id          TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(50)      NOT NULL,
    descripcion VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_nombre (nombre)
);

CREATE TABLE users (
    id            INT              NOT NULL AUTO_INCREMENT,
    role_id       TINYINT UNSIGNED NOT NULL,
    nombre        VARCHAR(100)     NOT NULL,
    email         VARCHAR(150)     NOT NULL,
    telefono      VARCHAR(20),
    password_hash VARCHAR(255)     NOT NULL,
    activo        BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_users_role_id (role_id)
);

CREATE TABLE coach_profiles (
    user_id      INT       NOT NULL,
    especialidad VARCHAR(100),
    biografia    TEXT,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_coach_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE client_profiles (
    user_id    INT          NOT NULL,
    coach_id   INT          NOT NULL,
    peso_kg    DECIMAL(5,2),
    altura_cm  DECIMAL(5,2),
    objetivo   VARCHAR(255),
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_client_profiles_user
        FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_client_profiles_coach
        FOREIGN KEY (coach_id) REFERENCES users(id),
    INDEX idx_client_profiles_coach_id (coach_id)
);

CREATE TABLE nutritionist_profiles (
    user_id      INT       NOT NULL,
    especialidad VARCHAR(100),
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_nutritionist_profiles_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE foods (
    id                INT          NOT NULL AUTO_INCREMENT,
    nombre            VARCHAR(100) NOT NULL,
    unidad            VARCHAR(30)  NOT NULL DEFAULT 'g',
    calorias_por_100g DECIMAL(6,2) NOT NULL,
    proteinas_g       DECIMAL(5,2) NOT NULL DEFAULT 0,
    carbohidratos_g   DECIMAL(5,2) NOT NULL DEFAULT 0,
    grasas_g          DECIMAL(5,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_foods_nombre (nombre)
);

CREATE TABLE exercises (
    id             INT          NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(100) NOT NULL,
    grupo_muscular VARCHAR(50),
    tipo           VARCHAR(50),
    nivel          VARCHAR(50),
    descripcion    TEXT,
    PRIMARY KEY (id),
    INDEX idx_exercises_grupo_muscular (grupo_muscular),
    INDEX idx_exercises_tipo (tipo)
);

CREATE TABLE routines (
    id           INT          NOT NULL AUTO_INCREMENT,
    client_id    INT          NOT NULL,
    coach_id     INT          NOT NULL,
    nombre       VARCHAR(100) NOT NULL,
    fecha_inicio DATE         NOT NULL,
    fecha_fin    DATE,
    activa       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_routines_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_routines_coach  FOREIGN KEY (coach_id)  REFERENCES users(id),
    INDEX idx_routines_client_id (client_id),
    INDEX idx_routines_coach_id  (coach_id)
);

CREATE TABLE routine_exercises (
    id           INT              NOT NULL AUTO_INCREMENT,
    routine_id   INT              NOT NULL,
    exercise_id  INT              NOT NULL,
    series       TINYINT UNSIGNED NOT NULL DEFAULT 3,
    repeticiones TINYINT UNSIGNED,
    peso_kg      DECIMAL(5,2),
    descanso_seg SMALLINT UNSIGNED DEFAULT 60,
    orden        TINYINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT fk_re_routine  FOREIGN KEY (routine_id)  REFERENCES routines(id)  ON DELETE CASCADE,
    CONSTRAINT fk_re_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    INDEX idx_re_routine_id  (routine_id),
    INDEX idx_re_exercise_id (exercise_id)
);

CREATE TABLE food_logs (
    id          INT          NOT NULL AUTO_INCREMENT,
    client_id   INT          NOT NULL,
    food_id     INT          NOT NULL,
    fecha       DATE         NOT NULL,
    tipo_comida VARCHAR(50),
    cantidad_g  DECIMAL(6,2) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_food_logs_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_food_logs_food   FOREIGN KEY (food_id)   REFERENCES foods(id)  ON DELETE CASCADE,
    INDEX idx_food_logs_client_fecha (client_id, fecha)
);

CREATE TABLE progress_records (
    id               INT          NOT NULL AUTO_INCREMENT,
    client_id        INT          NOT NULL,
    fecha            DATE         NOT NULL,
    peso_kg          DECIMAL(5,2) NOT NULL,
    altura_cm        DECIMAL(5,2) NOT NULL,
    imc              DECIMAL(5,2) GENERATED ALWAYS AS
                         (peso_kg / ((altura_cm / 100) * (altura_cm / 100))) STORED,
    porcentaje_grasa DECIMAL(5,2),
    masa_muscular_kg DECIMAL(5,2),
    notas            TEXT,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_progress_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_progress_client_fecha (client_id, fecha)
);

-- Vistas
CREATE OR REPLACE VIEW v_food_logs_detalle AS
SELECT fl.id, fl.client_id, u.nombre AS cliente, fl.fecha, fl.tipo_comida,
    fl.cantidad_g, f.nombre AS alimento, f.unidad,
    ROUND(fl.cantidad_g / 100 * f.calorias_por_100g, 2) AS calorias_kcal,
    ROUND(fl.cantidad_g / 100 * f.proteinas_g,       2) AS proteinas_g,
    ROUND(fl.cantidad_g / 100 * f.carbohidratos_g,   2) AS carbohidratos_g,
    ROUND(fl.cantidad_g / 100 * f.grasas_g,          2) AS grasas_g,
    fl.created_at
FROM food_logs fl
JOIN foods f ON f.id = fl.food_id
JOIN users u ON u.id = fl.client_id;

CREATE OR REPLACE VIEW v_progress_resumen AS
SELECT pr.id, pr.client_id, u.nombre AS cliente, pr.fecha,
    pr.peso_kg, pr.imc, pr.porcentaje_grasa, pr.masa_muscular_kg,
    ROUND(pr.peso_kg - LAG(pr.peso_kg) OVER (
        PARTITION BY pr.client_id ORDER BY pr.fecha
    ), 2) AS delta_peso_kg,
    pr.notas
FROM progress_records pr
JOIN users u ON u.id = pr.client_id;

CREATE OR REPLACE VIEW v_users_con_rol AS
SELECT u.id, u.nombre, u.email, u.telefono, u.activo,
    r.nombre AS rol, u.created_at, u.updated_at
FROM users u
JOIN roles r ON r.id = u.role_id;

-- Seed de roles (ejecutar una sola vez)
INSERT INTO roles (id, nombre, descripcion) VALUES
    (1, 'admin',        'Acceso total al sistema'),
    (2, 'coach',        'Entrenador personal — gestiona sus clientes'),
    (3, 'client',       'Atleta — accede solo a sus propios datos'),
    (4, 'nutritionist', 'Nutricionista — acceso al módulo de nutrición');

-- Seed de usuarios iniciales de prueba (Password para todos: nombre_rol + Password2026, ej: adminPassword2026, coachPassword2026, clientPassword2026, nutriPassword2026)
INSERT INTO users (id, role_id, nombre, email, password_hash, activo) VALUES
    (1, 1, 'Administrador FitApp', 'admin@fitapp.com', '$2b$10$BCtRlMB5T/vcf2t9twxSDu50MVir8gf3jhLcamCbYR2oi.hXfgW/a', TRUE),
    (2, 2, 'Carlos Entrenador',     'coach@fitapp.com', '$2b$10$ilOAE.UK0iWwpP9caHtlg.lpQ6byj/TEpTydwijiBu9bfhZoC2nMi', TRUE),
    (3, 3, 'Juan Cliente',          'client@fitapp.com', '$2b$10$cjBWDprEZSC.xrXUztR9HethRXa6ecunRqSQ81Fm5UqQoFxfj.ifK', TRUE),
    (4, 4, 'Ana Nutricionista',     'nutri@fitapp.com', '$2b$10$zfRpew/ef15AcikXnYYgveI/VN0tvNgd51H7PwlopEtlucUOB6b9u', TRUE);

-- Seed de perfiles para los usuarios de prueba
INSERT INTO coach_profiles (user_id, especialidad, biografia) VALUES
    (2, 'Fuerza e Hipertrofia', 'Certificado en acondicionamiento físico con más de 8 años de experiencia.');

INSERT INTO client_profiles (user_id, coach_id, peso_kg, altura_cm, objetivo) VALUES
    (3, 2, 78.50, 175.00, 'Ganancia de masa muscular y acondicionamiento general');

INSERT INTO nutritionist_profiles (user_id, especialidad) VALUES
    (4, 'Nutrición Deportiva y Metabolismo Clínico');