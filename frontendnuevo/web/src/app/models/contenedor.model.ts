export interface Contenedor {
    id: number | null;
    tipo_residuo: string | null;
    capacidad_litros: number | null;
    fecha_ultima_recogida: string | null;
    estado_conservacion: string | null;
    barrio: string | null;
    geom: string;
}