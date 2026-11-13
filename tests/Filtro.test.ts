import { describe, it, expect } from "vitest";
import { Filtro } from "../src/Filtro";
import { GestorDeFiltros } from "../src/GestorDeFiltros";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";
import { noLeido, esFavorito, and } from "../src/Predicados";

const ana = new Contacto("Ana", "ana@ucp.edu.ar");

describe("Filtro", () => {
  it("tiene un nombre y una condición", () => {
    const filtro = new Filtro("No leídos", noLeido);
    expect(filtro.getNombre()).toBe("No leídos");
    expect(filtro.cumple(new Correo(ana, "Hola"))).toBe(true);
  });

  it("no permite un nombre vacío", () => {
    expect(() => new Filtro("   ", noLeido)).toThrow("nombre");
  });

  it("aplicar devuelve solo los correos que cumplen la condición", () => {
    const leido = new Correo(ana, "Uno");
    leido.marcarComoLeido();
    const sinLeer = new Correo(ana, "Dos");
    const filtro = new Filtro("No leídos", noLeido);
    expect(filtro.aplicar([leido, sinLeer])).toEqual([sinLeer]);
  });

  it("no guarda correos: evalúa la colección que recibe en cada consulta", () => {
    const filtro = new Filtro("No leídos", noLeido);
    const c1 = new Correo(ana, "Uno");
    const c2 = new Correo(ana, "Dos");
    expect(filtro.aplicar([c1])).toEqual([c1]);
    expect(filtro.aplicar([c2])).toEqual([c2]);
    expect(filtro.aplicar([])).toEqual([]);
  });

  it("aplicar no modifica la colección recibida", () => {
    const leido = new Correo(ana, "Uno");
    leido.marcarComoLeido();
    const lista = [leido, new Correo(ana, "Dos")];
    new Filtro("No leídos", noLeido).aplicar(lista);
    expect(lista).toHaveLength(2);
  });

  it("su predicado se puede reutilizar para armar otro filtro", () => {
    const noLeidos = new Filtro("No leídos", noLeido);
    const favoritosSinLeer = new Filtro("Favoritos sin leer", and(noLeidos.getPredicado(), esFavorito));
    const correo = new Correo(ana, "Hola");
    expect(favoritosSinLeer.cumple(correo)).toBe(false);
    correo.marcarFavorito();
    expect(favoritosSinLeer.cumple(correo)).toBe(true);
  });
});

describe("GestorDeFiltros", () => {
  it("empieza sin filtros", () => {
    const gestor = new GestorDeFiltros();
    expect(gestor.listar()).toEqual([]);
  });

  it("registra filtros y los busca por nombre", () => {
    const gestor = new GestorDeFiltros();
    const filtro = new Filtro("No leídos", noLeido);
    gestor.registrar(filtro);
    expect(gestor.buscar("no leídos")).toBe(filtro);
    expect(gestor.buscar("Otro")).toBeUndefined();
  });

  it("permite registrar hasta cinco filtros", () => {
    const gestor = new GestorDeFiltros();
    [1, 2, 3, 4, 5].forEach((n) => gestor.registrar(new Filtro(`Filtro ${n}`, noLeido)));
    expect(gestor.cantidad()).toBe(5);
  });

  it("rechaza el sexto filtro", () => {
    const gestor = new GestorDeFiltros();
    [1, 2, 3, 4, 5].forEach((n) => gestor.registrar(new Filtro(`Filtro ${n}`, noLeido)));
    expect(() => gestor.registrar(new Filtro("Filtro 6", noLeido))).toThrow("5");
    expect(gestor.cantidad()).toBe(5);
  });

  it("no permite dos filtros con el mismo nombre", () => {
    const gestor = new GestorDeFiltros();
    gestor.registrar(new Filtro("No leídos", noLeido));
    expect(() => gestor.registrar(new Filtro("NO LEÍDOS", esFavorito))).toThrow("Ya existe");
    expect(gestor.cantidad()).toBe(1);
  });

  it("listar devuelve una copia que no modifica el registro", () => {
    const gestor = new GestorDeFiltros();
    gestor.registrar(new Filtro("No leídos", noLeido));
    gestor.listar().pop();
    expect(gestor.cantidad()).toBe(1);
  });
});