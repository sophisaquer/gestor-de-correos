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

describe("GestorDeCorreos - borradores", () => {
  it("permite recuperar los borradores guardados", () => {
    const gestor = new GestorDeCorreos();
    const b1 = new Correo(ana, "Uno");
    const b2 = new Correo(ana);
    gestor.guardarBorrador(b1);
    gestor.guardarBorrador(b2);
    expect(gestor.listar("borradores")).toEqual([b1, b2]);
  });

  it("edita el asunto y el cuerpo de un borrador", () => {
    const gestor = new GestorDeCorreos();
    const borrador = new Correo(ana);
    gestor.guardarBorrador(borrador);
    gestor.editarBorrador(borrador, { asunto: "Reunión", cuerpo: "Mañana a las 10" });
    const recuperado = gestor.listar("borradores")[0];
    expect(recuperado.getAsunto()).toBe("Reunión");
    expect(recuperado.getCuerpo()).toBe("Mañana a las 10");
  });

  it("solo cambia los campos indicados", () => {
    const gestor = new GestorDeCorreos();
    const borrador = new Correo(ana, "Asunto original", "Cuerpo original");
    gestor.guardarBorrador(borrador);
    gestor.editarBorrador(borrador, { cuerpo: "Cuerpo nuevo" });
    expect(borrador.getAsunto()).toBe("Asunto original");
    expect(borrador.getCuerpo()).toBe("Cuerpo nuevo");
  });

  it("agrega y quita destinatarios de un borrador", () => {
    const gestor = new GestorDeCorreos();
    const borrador = new Correo(ana, "Hola", "", [beto]);
    gestor.guardarBorrador(borrador);
    const caro = new Contacto("Caro", "caro@gmail.com");
    gestor.editarBorrador(borrador, {
      agregarDestinatarios: [caro],
      quitarDestinatarios: ["beto@ucp.edu.ar"],
    });
    expect(borrador.getDestinatarios()).toEqual([caro]);
  });

  it("los cambios se conservan en la bandeja de borradores", () => {
    const gestor = new GestorDeCorreos();
    const borrador = new Correo(ana);
    gestor.guardarBorrador(borrador);
    gestor.editarBorrador(borrador, { asunto: "Primera versión" });
    gestor.editarBorrador(borrador, { asunto: "Versión final" });
    expect(gestor.listar("borradores")).toHaveLength(1);
    expect(gestor.listar("borradores")[0].getAsunto()).toBe("Versión final");
  });

  it("no permite editar un correo que no es borrador", () => {
    const gestor = new GestorDeCorreos();
    const recibido = new Correo(beto, "Hola", "", [ana]);
    gestor.recibir(recibido);
    expect(() => gestor.editarBorrador(recibido, { asunto: "Otro" })).toThrow("Solo se pueden editar borradores");
    expect(() => gestor.editarBorrador(new Correo(ana), { asunto: "Otro" })).toThrow("Solo se pueden editar borradores");
    expect(recibido.getAsunto()).toBe("Hola");
  });
});

describe("GestorDeCorreos - envío", () => {
  it("un correo enviado queda en Enviados", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(ana, "Hola", "", [beto]);
    gestor.enviar(correo);
    expect(gestor.listar("enviados")).toEqual([correo]);
    expect(gestor.bandejaDe(correo)).toBe("enviados");
  });

  it("se puede enviar a varios destinatarios", () => {
    const gestor = new GestorDeCorreos();
    const caro = new Contacto("Caro", "caro@gmail.com");
    const correo = new Correo(ana, "Hola", "", [beto, caro]);
    gestor.enviar(correo);
    expect(gestor.listar("enviados")[0].getDestinatarios()).toEqual([beto, caro]);
  });

  it("un borrador enviado pasa a Enviados y deja de estar en Borradores", () => {
    const gestor = new GestorDeCorreos();
    const borrador = new Correo(ana);
    gestor.guardarBorrador(borrador);
    gestor.editarBorrador(borrador, { asunto: "Entrega", agregarDestinatarios: [beto] });
    gestor.enviar(borrador);
    expect(gestor.listar("borradores")).toEqual([]);
    expect(gestor.listar("enviados")).toEqual([borrador]);
  });

  it("un borrador inválido no se envía y sigue en Borradores", () => {
    const gestor = new GestorDeCorreos();
    const borrador = new Correo(ana, "Sin destinatarios");
    gestor.guardarBorrador(borrador);
    expect(() => gestor.enviar(borrador)).toThrow("no es válido");
    expect(gestor.listar("borradores")).toEqual([borrador]);
    expect(gestor.listar("enviados")).toEqual([]);
  });

  it("un correo sin asunto no se envía", () => {
    const gestor = new GestorDeCorreos();
    expect(() => gestor.enviar(new Correo(ana, "", "Hola", [beto]))).toThrow("no es válido");
    expect(gestor.listar("enviados")).toEqual([]);
  });

  it("enviar dos veces el mismo correo no genera duplicados", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(ana, "Hola", "", [beto]);
    gestor.enviar(correo);
    expect(() => gestor.enviar(correo)).toThrow("ya fue enviado");
    expect(gestor.listar("enviados")).toHaveLength(1);
  });

  it("no se puede enviar un correo recibido", () => {
    const gestor = new GestorDeCorreos();
    const recibido = new Correo(beto, "Hola", "", [ana]);
    gestor.recibir(recibido);
    expect(() => gestor.enviar(recibido)).toThrow("Solo se pueden enviar");
    expect(gestor.listar("entrada")).toEqual([recibido]);
    expect(gestor.listar("enviados")).toEqual([]);
  });

  it("un correo enviado y eliminado se restaura a Enviados", () => {
    const gestor = new GestorDeCorreos();
    const correo = new Correo(ana, "Hola", "", [beto]);
    gestor.enviar(correo);
    gestor.eliminar(correo);
    gestor.restaurar(correo);
    expect(gestor.listar("enviados")).toEqual([correo]);
  });
});