export interface Carril {
    id: number | null;
    nombre_calle: string | null;
    longitud_metros: number | null;
    tipo_pavimento: string | null;
    sentido_unico: boolean;
    anyo_construccion: number | null;
    geom: string;
}