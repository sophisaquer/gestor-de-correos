import { Filtro } from "./Filtro";
import type { Contacto } from "./Contacto";
import {
  and,
  or,
  not,
  noLeido,
  esFavorito,
  delDominio,
  deRemitente,
  asuntoContiene,
  cuerpoContiene,
} from "./Predicados";

export const correosAcademicosImportantes = (): Filtro =>
  new Filtro("Correos académicos importantes", and(delDominio("ucp.edu.ar"), asuntoContiene("Examen")));

export const pendientesDeRevision = (): Filtro =>
  new Filtro("Pendientes de revisión", and(noLeido, cuerpoContiene("Entrega")));

export const personalesPrioritarios = (contacto: Contacto): Filtro =>
  new Filtro("Correos personales prioritarios", and(esFavorito, deRemitente(contacto)));

export const paraSeguimiento = (): Filtro =>
  new Filtro(
    "Correos para seguimiento",
    and(or(asuntoContiene("Proyecto"), asuntoContiene("Reunión")), not((correo) => correo.estaLeido())),
  );