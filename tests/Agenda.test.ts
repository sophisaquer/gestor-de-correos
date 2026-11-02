import { describe, it, expect } from "vitest";
import { Agenda } from "../src/Agenda";
import { Contacto } from "../src/Contacto";

describe("Agenda", () => {
  it("empieza vacía", () => {
    const agenda = new Agenda();
    expect(agenda.cantidad()).toBe(0);
    expect(agenda.listar()).toEqual([]);
  });

  it("agrega contactos", () => {
    const agenda = new Agenda();
    agenda.agregar(new Contacto("Ana", "ana@ucp.edu.ar"));
    agenda.agregar(new Contacto("Beto", "beto@ucp.edu.ar"));
    expect(agenda.cantidad()).toBe(2);
  });

  it("no permite dos contactos con el mismo email", () => {
    const agenda = new Agenda();
    agenda.agregar(new Contacto("Ana", "ana@ucp.edu.ar"));
    expect(() => agenda.agregar(new Contacto("Otra Ana", "ANA@ucp.edu.ar"))).toThrow("email");
    expect(agenda.cantidad()).toBe(1);
  });

  it("busca un contacto por email sin importar mayúsculas ni espacios", () => {
    const agenda = new Agenda();
    const ana = new Contacto("Ana", "ana@ucp.edu.ar");
    agenda.agregar(ana);
    expect(agenda.buscarPorEmail("  ANA@ucp.edu.ar ")).toBe(ana);
  });

  it("devuelve undefined si el email no está", () => {
    const agenda = new Agenda();
    expect(agenda.buscarPorEmail("nadie@ucp.edu.ar")).toBeUndefined();
  });

  it("busca contactos por parte del nombre", () => {
    const agenda = new Agenda();
    agenda.agregar(new Contacto("Ana Pérez", "ana@ucp.edu.ar"));
    agenda.agregar(new Contacto("Juan Pérez", "juan@ucp.edu.ar"));
    agenda.agregar(new Contacto("Beto Gómez", "beto@ucp.edu.ar"));
    const resultado = agenda.buscarPorNombre("pérez");
    expect(resultado.map((c) => c.getEmail())).toEqual(["ana@ucp.edu.ar", "juan@ucp.edu.ar"]);
  });

  it("elimina un contacto por email", () => {
    const agenda = new Agenda();
    agenda.agregar(new Contacto("Ana", "ana@ucp.edu.ar"));
    agenda.eliminar("ana@ucp.edu.ar");
    expect(agenda.cantidad()).toBe(0);
    expect(agenda.buscarPorEmail("ana@ucp.edu.ar")).toBeUndefined();
  });

  it("falla al eliminar un email que no existe", () => {
    const agenda = new Agenda();
    expect(() => agenda.eliminar("nadie@ucp.edu.ar")).toThrow("No existe");
  });

  it("listar devuelve una copia que no modifica la agenda", () => {
    const agenda = new Agenda();
    agenda.agregar(new Contacto("Ana", "ana@ucp.edu.ar"));
    agenda.listar().pop();
    expect(agenda.cantidad()).toBe(1);
  });
});