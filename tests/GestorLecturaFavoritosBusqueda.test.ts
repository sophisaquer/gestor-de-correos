import { describe, it, expect } from "vitest";
import { GestorDeCorreos } from "../src/GestorDeCorreos";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

const ana = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
const beto = new Contacto("Beto Gómez", "beto@gmail.com");

describe("GestorDeCorreos - leídos y no leídos", () => {
  it("se puede marcar un correo como leído y otra vez como no leído", () => {
    const correo = new Correo(beto, "Hola");
    correo.marcarComoLeido();
    expect(correo.estaLeido()).toBe(true);
    correo.marcarComoNoLeido();
    expect(correo.estaLeido()).toBe(false);
  });

  it("el estado se mantiene al consultar la bandeja", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    correo.marcarComoLeido();
    expect(gestor.listar("entrada")[0].estaLeido()).toBe(true);
  });

  it("obtiene los correos no leídos de una bandeja", () => {
    const gestor = new GestorDeCorreos();
    const leido = new Correo(beto, "Uno");
    const sinLeer = new Correo(beto, "Dos");
    gestor.recibir(leido);
    gestor.recibir(sinLeer);
    leido.marcarComoLeido();
    expect(gestor.noLeidos("entrada")).toEqual([sinLeer]);
  });

  it("el cambio de estado se refleja inmediatamente", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    expect(gestor.noLeidos("entrada")).toEqual([correo]);
    correo.marcarComoLeido();
    expect(gestor.noLeidos("entrada")).toEqual([]);
    correo.marcarComoNoLeido();
    expect(gestor.noLeidos("entrada")).toEqual([correo]);
  });

  it("una bandeja vacía no tiene no leídos", () => {
    const gestor = new GestorDeCorreos();
    expect(gestor.noLeidos("entrada")).toEqual([]);
  });
});