import { describe, it, expect } from "vitest";
import { asuntos, correosQueCumplen, cantidadNoLeidos, cantidadPorRemitente } from "../src/Estadisticas";
import { GestorDeCorreos } from "../src/GestorDeCorreos";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";
import { esFavorito, delDominio } from "../src/Predicados";

const ana = new Contacto("Ana", "ana@ucp.edu.ar");
const profe = new Contacto("Profe", "profe@ucp.edu.ar");
const caro = new Contacto("Caro", "caro@gmail.com");

function buzonDeAna(): GestorDeCorreos {
  const gestor = new GestorDeCorreos(ana);
  gestor.recibir(new Correo(profe, "Examen", "", [ana]));
  gestor.recibir(new Correo(caro, "Hola", "", [ana]));
  gestor.recibir(new Correo(profe, "Notas", "", [ana]));
  return gestor;
}

describe("Estadísticas", () => {
  it("obtiene la lista de asuntos de una bandeja con map", () => {
    const entrada = buzonDeAna().listar("entrada");
    expect(asuntos(entrada)).toEqual(["Examen", "Hola", "Notas"]);
  });

  it("la lista de asuntos de una bandeja vacía es vacía", () => {
    expect(asuntos(new GestorDeCorreos(ana).listar("enviados"))).toEqual([]);
  });

  it("obtiene los correos que cumplen una condición con filter", () => {
    const entrada = buzonDeAna().listar("entrada");
    expect(asuntos(correosQueCumplen(entrada, delDominio("ucp.edu.ar")))).toEqual(["Examen", "Notas"]);
    entrada[1].marcarFavorito();
    expect(asuntos(correosQueCumplen(entrada, esFavorito))).toEqual(["Hola"]);
  });

  it("cuenta los no leídos con reduce", () => {
    const entrada = buzonDeAna().listar("entrada");
    expect(cantidadNoLeidos(entrada)).toBe(3);
    entrada[0].marcarComoLeido();
    expect(cantidadNoLeidos(entrada)).toBe(2);
  });

  it("cuenta los correos por remitente con reduce", () => {
    const conteo = cantidadPorRemitente(buzonDeAna().listar("entrada"));
    expect(conteo.get("profe@ucp.edu.ar")).toBe(2);
    expect(conteo.get("caro@gmail.com")).toBe(1);
    expect(conteo.size).toBe(2);
  });

  it("las estadísticas no modifican los correos", () => {
    const entrada = buzonDeAna().listar("entrada");
    asuntos(entrada);
    cantidadNoLeidos(entrada);
    cantidadPorRemitente(entrada);
    expect(entrada.every((c) => !c.estaLeido())).toBe(true);
    expect(entrada).toHaveLength(3);
  });
});