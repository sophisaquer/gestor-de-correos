import { describe, it, expect } from "vitest";
import { Contacto } from "../src/Contacto";

describe("Contacto", () => {
  it("se crea con nombre y email válidos", () => {
    const c = new Contacto("Ana Pérez", "ana@ucp.edu.ar");
    expect(c.getNombre()).toBe("Ana Pérez");
    expect(c.getEmail()).toBe("ana@ucp.edu.ar");
  });
  it("rechaza un nombre vacío", () => {
    expect(() => new Contacto("   ", "ana@ucp.edu.ar")).toThrow("nombre");
  });

  it("permite cambiar el nombre", () => {
    const c = new Contacto("Ana", "ana@ucp.edu.ar");
    c.setNombre("Ana María");
    expect(c.getNombre()).toBe("Ana María");
  });

  it("no permite cambiar el nombre por uno vacío", () => {
    const c = new Contacto("Ana", "ana@ucp.edu.ar");
    expect(() => c.setNombre("")).toThrow("nombre");
    expect(c.getNombre()).toBe("Ana");
  });
  it("guarda el email en minúsculas y sin espacios", () => {
    const c = new Contacto("Ana", "  ANA@UCP.edu.ar ");
    expect(c.getEmail()).toBe("ana@ucp.edu.ar");
  });

  it("rechaza emails con formato inválido", () => {
    expect(() => new Contacto("Ana", "anaucp.edu.ar")).toThrow("email");
    expect(() => new Contacto("Ana", "ana@ucp")).toThrow("email");
    expect(() => new Contacto("Ana", "ana @ucp.edu.ar")).toThrow("email");
    expect(() => new Contacto("Ana", "")).toThrow("email");
  });
});