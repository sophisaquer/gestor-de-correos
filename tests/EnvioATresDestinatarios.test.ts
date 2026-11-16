import { describe, it, expect } from "vitest";
import { ServidorDeCorreos } from "../src/ServidorDeCorreos";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";

const ana = new Contacto("Ana", "ana@ucp.edu.ar");
const beto = new Contacto("Beto", "beto@ucp.edu.ar");
const caro = new Contacto("Caro", "caro@gmail.com");
const dani = new Contacto("Dani", "dani@gmail.com");

describe("Escenario: correo a tres destinatarios", () => {
  it("llega a los tres, y si uno lo elimina los otros dos lo conservan", () => {
    const servidor = new ServidorDeCorreos();
    [ana, beto, caro, dani].forEach((u) => servidor.registrar(u));
    const correo = new Correo(ana, "Reunión", "Nos vemos el lunes", [beto, caro, dani]);

    // Paso 1: Ana envía el correo a Beto, Caro y Dani
    servidor.enviar(correo);

    // Está en Enviados (bandeja de salida) de Ana
    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("enviados")).toEqual([correo]);

    // Está en la Entrada de los tres destinatarios
    for (const email of ["beto@ucp.edu.ar", "caro@gmail.com", "dani@gmail.com"]) {
      const entrada = servidor.buzonDe(email).listar("entrada");
      expect(entrada).toHaveLength(1);
      expect(entrada[0].getAsunto()).toBe("Reunión");
    }

    // Paso 2: Beto elimina el correo de su bandeja
    const buzonBeto = servidor.buzonDe("beto@ucp.edu.ar");
    buzonBeto.eliminar(buzonBeto.listar("entrada")[0]);

    // Beto ya no lo tiene en Entrada: pasó a Eliminados
    expect(buzonBeto.listar("entrada")).toEqual([]);
    expect(buzonBeto.listar("eliminados")).toHaveLength(1);

    // Caro y Dani lo siguen teniendo
    expect(servidor.buzonDe("caro@gmail.com").listar("entrada")).toHaveLength(1);
    expect(servidor.buzonDe("dani@gmail.com").listar("entrada")).toHaveLength(1);

    // Y Ana lo sigue teniendo en Enviados
    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("enviados")).toEqual([correo]);
  });
});
