import { describe, it, expect } from "vitest";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";
import { Agenda } from "../src/Agenda";

const ana = new Contacto("Ana", "ana@ucp.edu.ar");
const beto = new Contacto("Beto", "beto@ucp.edu.ar");
const caro = new Contacto("Caro", "caro@gmail.com");

describe("Correo", () => {
  it("se crea con remitente, asunto, cuerpo y destinatarios", () => {
    const correo = new Correo(ana, "Examen", "El examen es el lunes", [beto, caro]);
    expect(correo.getRemitente()).toBe(ana);
    expect(correo.getAsunto()).toBe("Examen");
    expect(correo.getCuerpo()).toBe("El examen es el lunes");
    expect(correo.getDestinatarios()).toEqual([beto, caro]);
  });

  it("cada correo tiene un id distinto", () => {
    const c1 = new Correo(ana, "Uno");
    const c2 = new Correo(ana, "Dos");
    expect(c1.getId()).not.toBe(c2.getId());
  });

  it("se pueden crear correos con distintos remitentes y destinatarios", () => {
    const c1 = new Correo(ana, "Hola", "", [beto]);
    const c2 = new Correo(beto, "Chau", "", [ana, caro]);
    expect(c1.getRemitente()).toBe(ana);
    expect(c2.getRemitente()).toBe(beto);
    expect(c1.getDestinatarios()).toEqual([beto]);
    expect(c2.getDestinatarios()).toEqual([ana, caro]);
  });

  it("puede crearse incompleto, sin asunto ni destinatarios", () => {
    const correo = new Correo(ana);
    expect(correo.getAsunto()).toBe("");
    expect(correo.getCuerpo()).toBe("");
    expect(correo.getDestinatarios()).toEqual([]);
  });

  it("empieza como no leído y no favorito", () => {
    const correo = new Correo(ana, "Hola");
    expect(correo.estaLeido()).toBe(false);
    expect(correo.esFavorito()).toBe(false);
  });

  it("permite cambiar el asunto y el cuerpo", () => {
    const correo = new Correo(ana);
    correo.setAsunto("Reunión");
    correo.setCuerpo("Nos vemos a las 10");
    expect(correo.getAsunto()).toBe("Reunión");
    expect(correo.getCuerpo()).toBe("Nos vemos a las 10");
  });

  it("agrega y quita destinatarios", () => {
    const correo = new Correo(ana);
    correo.agregarDestinatario(beto);
    correo.agregarDestinatario(caro);
    correo.quitarDestinatario("BETO@ucp.edu.ar");
    expect(correo.getDestinatarios()).toEqual([caro]);
  });

  it("no permite destinatarios repetidos", () => {
    const correo = new Correo(ana, "Hola", "", [beto]);
    expect(() => correo.agregarDestinatario(beto)).toThrow("ya está");
    expect(() => new Correo(ana, "Hola", "", [beto, beto])).toThrow("ya está");
    expect(correo.getDestinatarios()).toEqual([beto]);
  });

  it("falla al quitar un destinatario que no está", () => {
    const correo = new Correo(ana, "Hola", "", [beto]);
    expect(() => correo.quitarDestinatario("caro@gmail.com")).toThrow("no está");
  });

  it("modificar la lista devuelta no cambia los destinatarios del correo", () => {
    const correo = new Correo(ana, "Hola", "", [beto]);
    correo.getDestinatarios().push(caro);
    expect(correo.getDestinatarios()).toEqual([beto]);
  });

  it("modificar el arreglo usado al crearlo no cambia el correo", () => {
    const lista = [beto];
    const correo = new Correo(ana, "Hola", "", lista);
    lista.push(caro);
    expect(correo.getDestinatarios()).toEqual([beto]);
  });

  it("eliminar un contacto de la agenda no borra los correos que lo referencian", () => {
    const agenda = new Agenda();
    agenda.agregar(beto);
    const correo = new Correo(ana, "Hola", "", [beto]);
    agenda.eliminar("beto@ucp.edu.ar");
    expect(correo.getDestinatarios()).toEqual([beto]);
    expect(correo.getDestinatarios()[0].getEmail()).toBe("beto@ucp.edu.ar");
  });
});

describe("Correo - validación para enviar", () => {
  it("es válido con remitente, asunto y al menos un destinatario", () => {
    const correo = new Correo(ana, "Examen", "", [beto]);
    expect(correo.esValidoParaEnviar()).toBe(true);
  });

  it("es válido con varios destinatarios", () => {
    const correo = new Correo(ana, "Examen", "", [beto, caro]);
    expect(correo.esValidoParaEnviar()).toBe(true);
  });

  it("no es válido sin asunto", () => {
    const correo = new Correo(ana, "", "Hola", [beto]);
    expect(correo.esValidoParaEnviar()).toBe(false);
  });

  it("no es válido si el asunto tiene solo espacios", () => {
    const correo = new Correo(ana, "   ", "Hola", [beto]);
    expect(correo.esValidoParaEnviar()).toBe(false);
  });

  it("no es válido sin destinatarios", () => {
    const correo = new Correo(ana, "Examen");
    expect(correo.esValidoParaEnviar()).toBe(false);
  });

  it("deja de ser válido si se quita el único destinatario", () => {
    const correo = new Correo(ana, "Examen", "", [beto]);
    correo.quitarDestinatario("beto@ucp.edu.ar");
    expect(correo.esValidoParaEnviar()).toBe(false);
  });
});


describe("Correo - copia", () => {
  it("la copia tiene los mismos datos pero otro id", () => {
    const original = new Correo(ana, "Examen", "El lunes", [beto, caro]);
    const copia = original.copiar();
    expect(copia.getId()).not.toBe(original.getId());
    expect(copia.getRemitente()).toBe(ana);
    expect(copia.getAsunto()).toBe("Examen");
    expect(copia.getCuerpo()).toBe("El lunes");
    expect(copia.getDestinatarios()).toEqual([beto, caro]);
  });

  it("la copia empieza como no leída y no favorita", () => {
    const original = new Correo(ana, "Examen", "", [beto]);
    original.marcarComoLeido();
    original.marcarFavorito();
    const copia = original.copiar();
    expect(copia.estaLeido()).toBe(false);
    expect(copia.esFavorito()).toBe(false);
  });

  it("cambiar la copia no cambia el original", () => {
    const original = new Correo(ana, "Examen", "", [beto]);
    const copia = original.copiar();
    copia.marcarComoLeido();
    copia.agregarDestinatario(caro);
    expect(original.estaLeido()).toBe(false);
    expect(original.getDestinatarios()).toEqual([beto]);
  });
});