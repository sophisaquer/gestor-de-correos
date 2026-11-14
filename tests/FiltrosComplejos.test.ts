import { describe, it, expect } from "vitest";
import {
  correosAcademicosImportantes,
  pendientesDeRevision,
  personalesPrioritarios,
  paraSeguimiento,
} from "../src/FiltrosComplejos";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

const profe = new Contacto("Profe", "profe@ucp.edu.ar");
const ana = new Contacto("Ana", "ana@ucp.edu.ar");
const caro = new Contacto("Caro", "caro@gmail.com");

describe("Filtros complejos", () => {
  it("académicos importantes: de @ucp.edu.ar y con 'Examen' en el asunto", () => {
    const filtro = correosAcademicosImportantes();
    const examenUcp = new Correo(profe, "Examen final", "", [ana]);
    const examenGmail = new Correo(caro, "Examen final", "", [ana]);
    const otroUcp = new Correo(profe, "Aviso", "", [ana]);
    expect(filtro.getNombre()).toBe("Correos académicos importantes");
    expect(filtro.aplicar([examenUcp, examenGmail, otroUcp])).toEqual([examenUcp]);
  });

  it("pendientes de revisión: no leídos y con 'Entrega' en el cuerpo", () => {
    const filtro = pendientesDeRevision();
    const pendiente = new Correo(profe, "TP", "La entrega es el lunes", [ana]);
    const leido = new Correo(profe, "TP", "La entrega es el lunes", [ana]);
    leido.marcarComoLeido();
    const sinEntrega = new Correo(profe, "TP", "Nos vemos en clase", [ana]);
    expect(filtro.aplicar([pendiente, leido, sinEntrega])).toEqual([pendiente]);
  });

  it("personales prioritarios: favoritos y de un contacto determinado", () => {
    const filtro = personalesPrioritarios(caro);
    const favoritoDeCaro = new Correo(caro, "Hola", "", [ana]);
    favoritoDeCaro.marcarFavorito();
    const noFavoritoDeCaro = new Correo(caro, "Chau", "", [ana]);
    const favoritoDelProfe = new Correo(profe, "Aviso", "", [ana]);
    favoritoDelProfe.marcarFavorito();
    expect(filtro.aplicar([favoritoDeCaro, noFavoritoDeCaro, favoritoDelProfe])).toEqual([favoritoDeCaro]);
  });

  it("para seguimiento: 'Proyecto' o 'Reunión' en el asunto, excluyendo los leídos", () => {
    const filtro = paraSeguimiento();
    const proyecto = new Correo(profe, "Proyecto final", "", [ana]);
    const reunion = new Correo(caro, "Reunión del grupo", "", [ana]);
    const reunionLeida = new Correo(caro, "Reunión del grupo", "", [ana]);
    reunionLeida.marcarComoLeido();
    const otro = new Correo(caro, "Hola", "", [ana]);
    expect(filtro.aplicar([proyecto, reunion, reunionLeida, otro])).toEqual([proyecto, reunion]);
  });

  it("un filtro sin coincidencias devuelve una lista vacía", () => {
    const otro = new Correo(caro, "Hola", "", [ana]);
    expect(correosAcademicosImportantes().aplicar([otro])).toEqual([]);
  });
});