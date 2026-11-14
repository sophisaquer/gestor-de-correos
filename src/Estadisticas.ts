import type { Correo } from "./Correo";
import type { Predicado } from "./Predicados";

export const asuntos = (correos: Correo[]): string[] => correos.map((c) => c.getAsunto());

export const correosQueCumplen = (correos: Correo[], condicion: Predicado<Correo>): Correo[] =>
  correos.filter(condicion);

export const cantidadNoLeidos = (correos: Correo[]): number =>
  correos.reduce((total, c) => (c.estaLeido() ? total : total + 1), 0);

export const cantidadPorRemitente = (correos: Correo[]): Map<string, number> =>
  correos.reduce((conteo, c) => {
    const email = c.getRemitente().getEmail();
    conteo.set(email, (conteo.get(email) ?? 0) + 1);
    return conteo;
  }, new Map<string, number>());