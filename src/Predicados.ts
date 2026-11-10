import { Correo } from "./Correo";

export type Predicado<T> = (elemento: T) => boolean;

export const noLeido: Predicado<Correo> = (correo) => !correo.estaLeido();

export const esFavorito: Predicado<Correo> = (correo) => correo.esFavorito();