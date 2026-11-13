import { describe, it, expect } from "vitest";
import {
  noLeido,
  esFavorito,
  contieneTexto,
  and,
  or,
  not,
  delDominio,
  deRemitente,
  asuntoContiene,
  cuerpoContiene,
  type Predicado,
} from "../src/Predicados";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const beto = new Contacto("Beto Gómez", "beto@gmail.com");

describe("Predicados básicos", () => {
  it("noLeido es verdadero para un correo sin leer y falso para uno leído", () => {
    const correo = new Correo(ana, "Hola");
    expect(noLeido(correo)).toBe(true);
    correo.marcarComoLeido();
    expect(noLeido(correo)).toBe(false);
  });

  it("esFavorito es verdadero solo para correos marcados como favoritos", () => {
    const correo = new Correo(ana, "Hola");
    expect(esFavorito(correo)).toBe(false);
    correo.marcarFavorito();
    expect(esFavorito(correo)).toBe(true);
  });

  it("los predicados se pueden usar directamente con filter", () => {
    const leido = new Correo(ana, "Uno");
    leido.marcarComoLeido();
    const sinLeer = new Correo(ana, "Dos");
    expect([leido, sinLeer].filter(noLeido)).toEqual([sinLeer]);
    });
  });
  
describe("Predicado contieneTexto", () => {
  const correo = new Correo(ana, "Examen final", "La entrega es el lunes", [beto]);

  it("encuentra el texto en el asunto", () => {
    expect(contieneTexto("examen")(correo)).toBe(true);
  });

  it("encuentra el texto en el cuerpo", () => {
    expect(contieneTexto("entrega")(correo)).toBe(true);
  });

  it("encuentra el texto en el nombre o el email del remitente", () => {
    expect(contieneTexto("pérez")(correo)).toBe(true);
    expect(contieneTexto("ucp.edu")(correo)).toBe(true);
  });

  it("encuentra el texto en el nombre o el email de un destinatario", () => {
    expect(contieneTexto("gómez")(correo)).toBe(true);
    expect(contieneTexto("gmail")(correo)).toBe(true);
  });

  it("no distingue mayúsculas y acepta coincidencias parciales", () => {
    expect(contieneTexto("EXA")(correo)).toBe(true);
  });

  it("es falso si el texto no aparece en ningún campo", () => {
    expect(contieneTexto("vacaciones")(correo)).toBe(false);
  });
}); 

describe("Combinadores de predicados", () => {
  const mayorQueCinco: Predicado<number> = (n) => n > 5;
  const esPar: Predicado<number> = (n) => n % 2 === 0;

  it("and se cumple solo si se cumplen todos los predicados", () => {
    const parYMayor = and(esPar, mayorQueCinco);
    expect(parYMayor(8)).toBe(true);
    expect(parYMayor(4)).toBe(false);
    expect(parYMayor(7)).toBe(false);
  });

  it("or se cumple si se cumple alguno de los predicados", () => {
    const parOMayor = or(esPar, mayorQueCinco);
    expect(parOMayor(4)).toBe(true);
    expect(parOMayor(7)).toBe(true);
    expect(parOMayor(3)).toBe(false);
  });

  it("not se cumple cuando el predicado no se cumple", () => {
    const esImpar = not(esPar);
    expect(esImpar(3)).toBe(true);
    expect(esImpar(4)).toBe(false);
  });

  it("and y or aceptan más de dos predicados", () => {
    const menorQueDiez: Predicado<number> = (n) => n < 10;
    expect(and(esPar, mayorQueCinco, menorQueDiez)(8)).toBe(true);
    expect(and(esPar, mayorQueCinco, menorQueDiez)(12)).toBe(false);
    expect(or(esPar, mayorQueCinco, menorQueDiez)(11)).toBe(true);
  });

  it("los combinadores se pueden anidar y usar con correos", () => {
    const leidoNoFavorito = new Correo(ana, "Uno");
    leidoNoFavorito.marcarComoLeido();
    const sinLeerFavorito = new Correo(ana, "Dos");
    sinLeerFavorito.marcarFavorito();
    const sinLeerComun = new Correo(ana, "Tres");
    const correos = [leidoNoFavorito, sinLeerFavorito, sinLeerComun];
    expect(correos.filter(and(noLeido, not(esFavorito)))).toEqual([sinLeerComun]);
    expect(correos.filter(or(not(noLeido), esFavorito))).toEqual([leidoNoFavorito, sinLeerFavorito]);
  });
});

describe("Predicados por campo", () => {
  const juan = new Contacto("Juan", "juan@alumnos.com");
  const deLaUcp = new Correo(ana, "Examen de Paradigmas", "La entrega es el viernes", [beto]);
  const deJuan = new Correo(juan, "Reunión", "Nos vemos mañana", [ana]);

  it("delDominio reconoce remitentes de un dominio", () => {
    expect(delDominio("@ucp.edu.ar")(deLaUcp)).toBe(true);
    expect(delDominio("@ucp.edu.ar")(deJuan)).toBe(false);
  });

  it("delDominio funciona con o sin @ y sin importar mayúsculas", () => {
    expect(delDominio("UCP.edu.ar")(deLaUcp)).toBe(true);
  });

  it("delDominio no confunde un dominio que solo termina parecido", () => {
    const falso = new Correo(new Contacto("X", "x@noucp.edu.ar"), "Hola");
    expect(delDominio("@ucp.edu.ar")(falso)).toBe(false);
  });

  it("deRemitente reconoce los correos de un contacto determinado", () => {
    expect(deRemitente(juan)(deJuan)).toBe(true);
    expect(deRemitente(juan)(deLaUcp)).toBe(false);
  });

  it("asuntoContiene busca solo en el asunto", () => {
    expect(asuntoContiene("examen")(deLaUcp)).toBe(true);
    expect(asuntoContiene("entrega")(deLaUcp)).toBe(false);
  });

  it("cuerpoContiene busca solo en el cuerpo", () => {
    expect(cuerpoContiene("ENTREGA")(deLaUcp)).toBe(true);
    expect(cuerpoContiene("examen")(deLaUcp)).toBe(false);
  });
});