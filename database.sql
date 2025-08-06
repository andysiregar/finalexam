CREATE DATABASE IF NOT EXISTS employee_management;

USE employee_management;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    position VARCHAR(50),
    hire_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert admin user with hashed password (username: admin, password: Semoga777)
INSERT INTO users (username, password) VALUES 
('admin', '$2b$10$ogTyb3Tbm70h8NxoqrlwK.e7UDS7NPwlh7.O3EC.1zACd9yIxMLJq') 
ON DUPLICATE KEY UPDATE password = '$2b$10$ogTyb3Tbm70h8NxoqrlwK.e7UDS7NPwlh7.O3EC.1zACd9yIxMLJq';