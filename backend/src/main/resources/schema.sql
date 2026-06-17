CREATE TABLE app_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roman_sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    image_url VARCHAR(255),
    year_built INTEGER
);

CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES app_users(id),
    site_id INTEGER REFERENCES roman_sites(id),
    visited BOOLEAN DEFAULT FALSE,
    visit_date TIMESTAMP,
    UNIQUE(user_id, site_id)
);