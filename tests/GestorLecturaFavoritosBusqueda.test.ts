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
  
describe("GestorDeCorreos - favoritos", () => {
  it("se puede marcar y desmarcar un correo como favorito", () => {
    const correo = new Correo(beto, "Hola");
    correo.marcarFavorito();
    expect(correo.esFavorito()).toBe(true);
    correo.desmarcarFavorito();
    expect(correo.esFavorito()).toBe(false);
  });

  it("la vista de favoritos junta correos de distintas bandejas", () => {
    const gestor = new GestorDeCorreos();
    const recibido = new Correo(beto, "Recibido");
    const enviado = new Correo(ana, "Enviado", "", [beto]);
    const comun = new Correo(beto, "Común");
    gestor.recibir(recibido);
    gestor.enviar(enviado);
    gestor.recibir(comun);
    recibido.marcarFavorito();
    enviado.marcarFavorito();
    expect(gestor.favoritos()).toEqual([recibido, enviado]);
  });

  it("marcar como favorito no mueve el correo de su bandeja", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    correo.marcarFavorito();
    expect(gestor.bandejaDe(correo)).toBe("entrada");
    expect(gestor.listar("entrada")).toEqual([correo]);
  });

  it("no hay duplicados en la vista de favoritos", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    correo.marcarFavorito();
    correo.marcarFavorito();
    expect(gestor.favoritos()).toHaveLength(1);
  });

  it("un favorito eliminado no aparece hasta restaurarlo y conserva su marca", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(beto, "Hola");
    gestor.recibir(correo);
    correo.marcarFavorito();
    gestor.eliminar(correo);
    expect(gestor.favoritos()).toEqual([]);
    expect(correo.esFavorito()).toBe(true);
    gestor.restaurar(correo);
    expect(gestor.favoritos()).toEqual([correo]);
  });
});

describe("GestorDeCorreos - búsqueda", () => {
  it("encuentra correos de la Entrada por cualquiera de sus campos", () => {
    const gestor = new GestorDeCorreos();
    const examen = new Correo(ana, "Examen final", "Traer DNI", [beto]);
    const otro = new Correo(beto, "Cumpleaños", "El sábado", [ana]);
    gestor.recibir(examen);
    gestor.recibir(otro);
    expect(gestor.buscar("examen")).toEqual([examen]);
    expect(gestor.buscar("sábado")).toEqual([otro]);
  });

  it("no distingue mayúsculas y acepta coincidencias parciales", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(ana, "Examen final");
    gestor.recibir(correo);
    expect(gestor.buscar("EXAM")).toEqual([correo]);
  });

  it("un correo aparece una sola vez aunque coincida en varios campos", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(ana, "Ana", "Hola Ana", [beto]);
    gestor.recibir(correo);
    expect(gestor.buscar("ana")).toEqual([correo]);
  });

  it("devuelve una colección vacía si no hay coincidencias", () => {
    const gestor = new GestorDeCorreos();
    gestor.recibir(new Correo(ana, "Hola"));
    expect(gestor.buscar("vacaciones")).toEqual([]);
  });

  it("funciona sobre una bandeja vacía", () => {
    const gestor = new GestorDeCorreos();
    expect(gestor.buscar("hola")).toEqual([]);
  });

  it("solo busca en la Entrada", () => {
    const gestor = new GestorDeCorreos();
    gestor.enviar(new Correo(ana, "Examen", "", [beto]));
    expect(gestor.buscar("examen")).toEqual([]);
  });

  it("buscar no modifica los correos originales", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(ana, "Examen final", "Traer DNI", [beto]);
    gestor.recibir(correo);
    gestor.buscar("EXAMEN");
    expect(correo.getAsunto()).toBe("Examen final");
    expect(correo.getCuerpo()).toBe("Traer DNI");
    expect(correo.estaLeido()).toBe(false);
    expect(gestor.listar("entrada")).toEqual([correo]);
  });
});
});