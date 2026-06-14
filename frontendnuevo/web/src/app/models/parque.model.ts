export interface Parque {
    id: number | null;
    nombre: string;
    area_hectareas: number | null;
    tiene_zona_infantil: boolean;
    horario_cierre: string | null;
    tipo_mantenimiento: string | null;
    geom: string; // Recibirá el WKT de la geometría
}