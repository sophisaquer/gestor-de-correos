import { describe, it, expect } from "vitest";
import { ServidorDeCorreos } from "../src/ServidorDeCorreos";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

const ana = new Contacto("Ana", "ana@ucp.edu.ar");
const beto = new Contacto("Beto", "beto@ucp.edu.ar");
const caro = new Contacto("Caro", "caro@gmail.com");
const dani = new Contacto("Dani", "dani@gmail.com");

function servidorConUsuarios(): ServidorDeCorreos {
  const servidor = new ServidorDeCorreos();
  [ana, beto, caro, dani].forEach((u) => servidor.registrar(u));
  return servidor;
}

describe("ServidorDeCorreos - buzones", () => {
  it("cada usuario registrado tiene su propio buzón", () => {
    const servidor = servidorConUsuarios();
    expect(servidor.buzonDe("ana@ucp.edu.ar").getPropietario()).toBe(ana);
    expect(servidor.buzonDe("beto@ucp.edu.ar").getPropietario()).toBe(beto);
    expect(servidor.buzonDe("ana@ucp.edu.ar")).not.toBe(servidor.buzonDe("beto@ucp.edu.ar"));
  });

  it("no permite registrar dos veces el mismo email", () => {
    const servidor = new ServidorDeCorreos();
    servidor.registrar(ana);
    expect(() => servidor.registrar(ana)).toThrow("Ya existe");
  });

  it("falla al pedir el buzón de un email no registrado", () => {
    const servidor = new ServidorDeCorreos();
    expect(() => servidor.buzonDe("nadie@gmail.com")).toThrow("No existe");
  });
});

describe("ServidorDeCorreos - envío", () => {
  it("el correo queda en Enviados del remitente y en Entrada de cada destinatario", () => {
    const servidor = servidorConUsuarios();
    const correo = new Correo(ana, "Examen", "Es el lunes", [beto, caro]);
    servidor.enviar(correo);
    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("enviados")).toEqual([correo]);
    expect(servidor.buzonDe("beto@ucp.edu.ar").listar("entrada")).toHaveLength(1);
    expect(servidor.buzonDe("caro@gmail.com").listar("entrada")).toHaveLength(1);
    expect(servidor.buzonDe("dani@gmail.com").listar("entrada")).toEqual([]);
  });

  it("dos correos de distintos remitentes a los mismos destinatarios", () => {
    const servidor = servidorConUsuarios();
    const deAna = new Correo(ana, "Reunión", "", [caro, dani]);
    const deBeto = new Correo(beto, "Proyecto", "", [caro, dani]);
    servidor.enviar(deAna);
    servidor.enviar(deBeto);

    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("enviados")).toEqual([deAna]);
    expect(servidor.buzonDe("beto@ucp.edu.ar").listar("enviados")).toEqual([deBeto]);
    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("entrada")).toEqual([]);
    expect(servidor.buzonDe("beto@ucp.edu.ar").listar("entrada")).toEqual([]);

    for (const email of ["caro@gmail.com", "dani@gmail.com"]) {
      const entrada = servidor.buzonDe(email).listar("entrada");
      expect(entrada.map((c) => c.getAsunto())).toEqual(["Reunión", "Proyecto"]);
      expect(entrada.map((c) => c.getRemitente())).toEqual([ana, beto]);
    }
  });

  it("enviar un borrador lo saca de Borradores del remitente", () => {
    const servidor = servidorConUsuarios();
    const buzonAna = servidor.buzonDe("ana@ucp.edu.ar");
    const borrador = new Correo(ana, "Entrega", "", [beto]);
    buzonAna.guardarBorrador(borrador);
    servidor.enviar(borrador);
    expect(buzonAna.listar("borradores")).toEqual([]);
    expect(buzonAna.listar("enviados")).toEqual([borrador]);
    expect(servidor.buzonDe("beto@ucp.edu.ar").listar("entrada")).toHaveLength(1);
  });

  it("un correo inválido no llega a nadie", () => {
    const servidor = servidorConUsuarios();
    expect(() => servidor.enviar(new Correo(ana, "", "Hola", [beto]))).toThrow("no es válido");
    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("enviados")).toEqual([]);
    expect(servidor.buzonDe("beto@ucp.edu.ar").listar("entrada")).toEqual([]);
  });

  it("si un destinatario no tiene buzón, no se envía a nadie", () => {
    const servidor = new ServidorDeCorreos();
    servidor.registrar(ana);
    servidor.registrar(beto);
    const correo = new Correo(ana, "Hola", "", [beto, caro]);
    expect(() => servidor.enviar(correo)).toThrow("No existe un buzón");
    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("enviados")).toEqual([]);
    expect(servidor.buzonDe("beto@ucp.edu.ar").listar("entrada")).toEqual([]);
  });
});

describe("ServidorDeCorreos - eliminación", () => {
  it("si el destinatario elimina el correo, el remitente lo sigue teniendo", () => {
    const servidor = servidorConUsuarios();
    const correo = new Correo(ana, "Hola", "", [beto]);
    servidor.enviar(correo);
    const buzonBeto = servidor.buzonDe("beto@ucp.edu.ar");
    const recibido = buzonBeto.listar("entrada")[0];
    buzonBeto.eliminar(recibido);
    expect(buzonBeto.listar("entrada")).toEqual([]);
    expect(buzonBeto.listar("eliminados")).toEqual([recibido]);
    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("enviados")).toEqual([correo]);
  });

  it("si el remitente elimina el correo, los destinatarios lo siguen teniendo", () => {
    const servidor = servidorConUsuarios();
    const correo = new Correo(ana, "Hola", "", [beto, caro]);
    servidor.enviar(correo);
    servidor.buzonDe("ana@ucp.edu.ar").eliminar(correo);
    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("eliminados")).toEqual([correo]);
    expect(servidor.buzonDe("beto@ucp.edu.ar").listar("entrada")).toHaveLength(1);
    expect(servidor.buzonDe("caro@gmail.com").listar("entrada")).toHaveLength(1);
  });

  it("si un destinatario elimina el correo, los otros destinatarios lo siguen teniendo", () => {
    const servidor = servidorConUsuarios();
    servidor.enviar(new Correo(ana, "Hola", "", [beto, caro]));
    const buzonBeto = servidor.buzonDe("beto@ucp.edu.ar");
    buzonBeto.eliminar(buzonBeto.listar("entrada")[0]);
    expect(servidor.buzonDe("caro@gmail.com").listar("entrada")).toHaveLength(1);
  });

  it("marcar como leído en un buzón no afecta a los demás", () => {
    const servidor = servidorConUsuarios();
    const correo = new Correo(ana, "Hola", "", [beto, caro]);
    servidor.enviar(correo);
    servidor.buzonDe("beto@ucp.edu.ar").listar("entrada")[0].marcarComoLeido();
    expect(servidor.buzonDe("caro@gmail.com").noLeidos("entrada")).toHaveLength(1);
    expect(correo.estaLeido()).toBe(false);
  });
});