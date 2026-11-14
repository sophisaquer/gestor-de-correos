import { describe, it, expect } from "vitest";
import { GestorDeCorreos } from "../src/GestorDeCorreos";
import { GestorDeFiltros } from "../src/GestorDeFiltros";
import { Filtro } from "../src/Filtro";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";
import { delDominio, noLeido } from "../src/Predicados";
import { pendientesDeRevision } from "../src/FiltrosComplejos";

const ana = new Contacto("Ana", "ana@ucp.edu.ar");
const profe = new Contacto("Profe", "profe@ucp.edu.ar");
const caro = new Contacto("Caro", "caro@gmail.com");

describe("Aplicación de filtros en el gestor", () => {
  it("aplica un filtro sobre una bandeja", () => {
    const gestor = new GestorDeCorreos(ana);
    const deUcp = new Correo(profe, "Aviso", "", [ana]);
    const deGmail = new Correo(caro, "Hola", "", [ana]);
    gestor.recibir(deUcp);
    gestor.recibir(deGmail);
    const filtro = new Filtro("Correos de la UCP", delDominio("ucp.edu.ar"));
    expect(gestor.aplicarFiltro(filtro, "entrada")).toEqual([deUcp]);
  });

  it("el mismo filtro se puede aplicar sobre distintas bandejas", () => {
    const gestor = new GestorDeCorreos(ana);
    const recibido = new Correo(profe, "Aviso", "", [ana]);
    const enviado = new Correo(ana, "Consulta", "", [profe]);
    const enviadoAGmail = new Correo(ana, "Hola", "", [caro]);
    gestor.recibir(recibido);
    gestor.enviar(enviado);
    gestor.enviar(enviadoAGmail);
    const filtro = new Filtro("Correos de la UCP", delDominio("ucp.edu.ar"));
    expect(gestor.aplicarFiltro(filtro, "entrada")).toEqual([recibido]);
    expect(gestor.aplicarFiltro(filtro, "enviados")).toEqual([enviado, enviadoAGmail]);
    expect(gestor.aplicarFiltro(filtro, "borradores")).toEqual([]);
  });

  it("los cambios en los correos se reflejan sin volver a guardarlos", () => {
    const gestor = new GestorDeCorreos(ana);
    const correo = new Correo(profe, "TP", "La entrega es el lunes", [ana]);
    gestor.recibir(correo);
    const filtro = pendientesDeRevision();
    expect(gestor.aplicarFiltro(filtro, "entrada")).toEqual([correo]);
    correo.marcarComoLeido();
    expect(gestor.aplicarFiltro(filtro, "entrada")).toEqual([]);
  });

  it("aplicar un filtro no modifica los correos ni la bandeja", () => {
    const gestor = new GestorDeCorreos(ana);
    const correo = new Correo(profe, "Aviso", "Hola", [ana]);
    gestor.recibir(correo);
    const filtro = new Filtro("No leídos", noLeido);
    const resultado = gestor.aplicarFiltro(filtro, "entrada");
    resultado.pop();
    expect(gestor.listar("entrada")).toEqual([correo]);
    expect(correo.estaLeido()).toBe(false);
    expect(correo.getAsunto()).toBe("Aviso");
  });

  it("un filtro registrado se reutiliza en diferentes consultas y buzones", () => {
    const filtros = new GestorDeFiltros();
    filtros.registrar(new Filtro("No leídos", noLeido));
    const filtro = filtros.buscar("No leídos")!;

    const buzonAna = new GestorDeCorreos(ana);
    const buzonCaro = new GestorDeCorreos(caro);
    buzonAna.recibir(new Correo(profe, "Uno", "", [ana]));
    buzonCaro.recibir(new Correo(profe, "Dos", "", [caro]));
    buzonCaro.recibir(new Correo(profe, "Tres", "", [caro]));

    expect(buzonAna.aplicarFiltro(filtro, "entrada")).toHaveLength(1);
    expect(buzonCaro.aplicarFiltro(filtro, "entrada")).toHaveLength(2);
    expect(buzonAna.aplicarFiltro(filtro, "entrada")).toHaveLength(1);
  });
});