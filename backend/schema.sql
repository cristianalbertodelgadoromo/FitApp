CREATE DATABASE IF NOT EXISTS fitapp_db;
USE fitapp_db;

CREATE TABLE coaches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    peso DECIMAL(5,2),
    altura DECIMAL(5,2), -- en centímetros
    objetivo VARCHAR(255),
    imc DECIMAL(5,2),
    porcentaje_grasa DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
);

CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    calorias_por_100g DECIMAL(6,2) NOT NULL,
    proteinas DECIMAL(5,2) NOT NULL,
    carbohidratos DECIMAL(5,2) NOT NULL,
    grasas DECIMAL(5,2) NOT NULL
);

CREATE TABLE exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    grupo_muscular VARCHAR(50),
    tipo VARCHAR(50), -- ej. Fuerza, Cardio, Flexibilidad
    nivel VARCHAR(50) -- ej. Principiante, Intermedio, Avanzado
);

CREATE TABLE routines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    coach_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE
);

CREATE TABLE food_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    fecha DATE NOT NULL,
    tipo_comida VARCHAR(50), -- ej. Desayuno, Almuerzo, Cena, Snack
    food_id INT NOT NULL,
    cantidad_g DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

CREATE TABLE progress_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    fecha DATE NOT NULL,
    peso_kg DECIMAL(5,2) NOT NULL,
    porcentaje_grasa DECIMAL(5,2),
    notas TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
