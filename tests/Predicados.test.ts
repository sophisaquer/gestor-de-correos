import { describe, it, expect } from "vitest";
import { noLeido, esFavorito } from "../src/Predicados";
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