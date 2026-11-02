import { describe, it, expect } from "vitest";
import { GestorDeCorreos } from "../src/GestorDeCorreos";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

const ana = new Contacto("Ana", "ana@ucp.edu.ar");
const beto = new Contacto("Beto", "beto@ucp.edu.ar");

describe("GestorDeCorreos", () => {
  it("empieza con las cuatro bandejas vacías", () => {
    const gestor = new GestorDeCorreos();
    expect(gestor.listar("entrada")).toEqual([]);
    expect(gestor.listar("enviados")).toEqual([]);
    expect(gestor.listar("borradores")).toEqual([]);
    expect(gestor.listar("eliminados")).toEqual([]);
  });

  it("un correo recibido queda en Entrada", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola", "", [ana]);
    gestor.recibir(correo);
    expect(gestor.listar("entrada")).toEqual([correo]);
    expect(gestor.bandejaDe(correo)).toBe("entrada");
  });

  it("un borrador guardado queda en Borradores", () => {
    const gestor = new GestorDeCorreos();
    const borrador = new Correo(ana);
    gestor.guardarBorrador(borrador);
    expect(gestor.listar("borradores")).toEqual([borrador]);
    expect(gestor.bandejaDe(borrador)).toBe("borradores");
  });

  it("un correo que no está en el gestor no tiene bandeja", () => {
    const gestor = new GestorDeCorreos();
    expect(gestor.bandejaDe(new Correo(ana, "Hola"))).toBeUndefined();
  });

  it("un correo no puede estar en dos bandejas a la vez", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    expect(() => gestor.recibir(correo)).toThrow("ya está");
    expect(() => gestor.guardarBorrador(correo)).toThrow("ya está");
    expect(gestor.listar("entrada")).toEqual([correo]);
    expect(gestor.listar("borradores")).toEqual([]);
  });

  it("eliminar mueve el correo a Eliminados y lo saca de su bandeja", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    gestor.eliminar(correo);
    expect(gestor.listar("entrada")).toEqual([]);
    expect(gestor.listar("eliminados")).toEqual([correo]);
    expect(gestor.bandejaDe(correo)).toBe("eliminados");
  });

  it("no permite eliminar dos veces el mismo correo", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    gestor.eliminar(correo);
    expect(() => gestor.eliminar(correo)).toThrow("ya está eliminado");
    expect(gestor.listar("eliminados")).toEqual([correo]);
  });

  it("falla al eliminar un correo que no está en el gestor", () => {
    const gestor = new GestorDeCorreos();
    expect(() => gestor.eliminar(new Correo(ana, "Hola"))).toThrow("no está");
  });

  it("restaura un correo de Entrada a Entrada", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    gestor.eliminar(correo);
    gestor.restaurar(correo);
    expect(gestor.listar("eliminados")).toEqual([]);
    expect(gestor.listar("entrada")).toEqual([correo]);
  });

  it("restaura un borrador a Borradores", () => {
    const gestor = new GestorDeCorreos();
    const borrador = new Correo(ana);
    gestor.guardarBorrador(borrador);
    gestor.eliminar(borrador);
    gestor.restaurar(borrador);
    expect(gestor.listar("borradores")).toEqual([borrador]);
    expect(gestor.listar("entrada")).toEqual([]);
  });

  it("solo se pueden restaurar correos eliminados", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    expect(() => gestor.restaurar(correo)).toThrow("eliminados");
    expect(() => gestor.restaurar(new Correo(ana, "Otro"))).toThrow("eliminados");
    expect(gestor.listar("entrada")).toEqual([correo]);
  });

  it("eliminar y restaurar varias veces no genera duplicados", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    gestor.eliminar(correo);
    gestor.restaurar(correo);
    gestor.eliminar(correo);
    gestor.restaurar(correo);
    expect(gestor.listar("entrada")).toEqual([correo]);
    expect(gestor.listar("eliminados")).toEqual([]);
  });

  it("listar devuelve una copia que no modifica la bandeja", () => {
    const gestor = new GestorDeCorreos();
    gestor.recibir(new Correo(beto, "Hola"));
    gestor.listar("entrada").pop();
    expect(gestor.listar("entrada")).toHaveLength(1);
  });
});