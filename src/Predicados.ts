import { Correo } from "./Correo";

export type Predicado<T> = (elemento: T) => boolean;

export const noLeido: Predicado<Correo> = (correo) => !correo.estaLeido();

export const esFavorito: Predicado<Correo> = (correo) => correo.esFavorito();

export const contieneTexto = (texto: string): Predicado<Correo> => {
  const buscado = texto.trim().toLowerCase();
  return (correo) => {
    const remitente = correo.getRemitente();
    const campos = [
      correo.getAsunto(),
      correo.getCuerpo(),
      remitente.getNombre(),
      remitente.getEmail(),
      ...correo.getDestinatarios().flatMap((d) => [d.getNombre(), d.getEmail()]),
    ];
    return campos.some((campo) => campo.toLowerCase().includes(buscado));
  };
};

export const and = <T>(...predicados: Predicado<T>[]): Predicado<T> =>
  (elemento) => predicados.every((p) => p(elemento));

export const or = <T>(...predicados: Predicado<T>[]): Predicado<T> =>
  (elemento) => predicados.some((p) => p(elemento));

export const not = <T>(predicado: Predicado<T>): Predicado<T> =>
  (elemento) => !predicado(elemento);