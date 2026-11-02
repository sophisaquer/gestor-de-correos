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
});