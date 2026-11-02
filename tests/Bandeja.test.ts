import { describe, it, expect } from "vitest";
import { Bandeja } from "../src/Bandeja";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

const ana = new Contacto("Ana", "ana@ucp.edu.ar");

describe("Bandeja", () => {
  it("empieza vacía y conoce su tipo", () => {
    const bandeja = new Bandeja("entrada");
    expect(bandeja.getTipo()).toBe("entrada");
    expect(bandeja.cantidad()).toBe(0);
    expect(bandeja.listar()).toEqual([]);
  });

  it("agrega correos y permite consultarlos", () => {
    const bandeja = new Bandeja("entrada");
    const c1 = new Correo(ana, "Uno");
    const c2 = new Correo(ana, "Dos");
    bandeja.agregar(c1);
    bandeja.agregar(c2);
    expect(bandeja.listar()).toEqual([c1, c2]);
    expect(bandeja.contiene(c1)).toBe(true);
  });

  it("no permite agregar el mismo correo dos veces", () => {
    const bandeja = new Bandeja("entrada");
    const correo = new Correo(ana, "Hola");
    bandeja.agregar(correo);
    expect(() => bandeja.agregar(correo)).toThrow("ya está");
    expect(bandeja.cantidad()).toBe(1);
  });

  it("quita un correo", () => {
    const bandeja = new Bandeja("entrada");
    const correo = new Correo(ana, "Hola");
    bandeja.agregar(correo);
    bandeja.quitar(correo);
    expect(bandeja.contiene(correo)).toBe(false);
    expect(bandeja.cantidad()).toBe(0);
  });

  it("falla al quitar un correo que no está", () => {
    const bandeja = new Bandeja("entrada");
    expect(() => bandeja.quitar(new Correo(ana, "Hola"))).toThrow("no está");
  });

  it("listar devuelve una copia que no modifica la bandeja", () => {
    const bandeja = new Bandeja("entrada");
    bandeja.agregar(new Correo(ana, "Hola"));
    bandeja.listar().pop();
    expect(bandeja.cantidad()).toBe(1);
  });
});