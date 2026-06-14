CREATE DATABASE Smartcity;

\c smartcity;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE SCHEMA IF NOT EXISTS d;

-- TABLA DE POLÍGONOS (Zonas Verdes)
CREATE TABLE d.parques (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    area_hectareas DOUBLE PRECISION,
    tiene_zona_infantil BOOLEAN,
    horario_cierre VARCHAR(50),
    tipo_mantenimiento VARCHAR(100),
    geom geometry("POLYGON", 25830)
);

-- TABLA DE LÍNEAS (Carriles Bici)
CREATE TABLE d.carriles_bici (
    id SERIAL PRIMARY KEY,
    nombre_calle VARCHAR(100),
    longitud_metros DOUBLE PRECISION,
    tipo_pavimento VARCHAR(50),
    sentido_unico BOOLEAN,
    anyo_construccion INTEGER,
    geom geometry("LINESTRING", 25830)
);

-- TABLA DE PUNTOS (Reciclaje)
CREATE TABLE d.contenedores (
    id SERIAL PRIMARY KEY,
    tipo_residuo VARCHAR(50),
    capacidad_litros DOUBLE PRECISION,
    fecha_ultima_recogida DATE,
    estado_conservacion VARCHAR(50),
    barrio VARCHAR(100),
    geom geometry("POINT", 25830)
);