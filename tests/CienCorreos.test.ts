import { describe, it, expect } from "vitest";
import { ServidorDeCorreos } from "../src/ServidorDeCorreos";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";
import { Filtro } from "../src/Filtro";
import { asuntoContiene } from "../src/Predicados";

const ana = new Contacto("Ana", "ana@ucp.edu.ar");
const beto = new Contacto("Beto", "beto@ucp.edu.ar");

describe("Escenario: cien correos filtrados por asunto", () => {
  it("de 100 correos enviados, el filtro encuentra solo los que dicen Examen en el asunto", () => {
    const servidor = new ServidorDeCorreos();
    servidor.registrar(ana);
    servidor.registrar(beto);

    // Ana envía 100 correos a Beto: uno de cada diez dice "Examen"
    for (let i = 1; i <= 100; i++) {
      const asunto = i % 10 === 0 ? `Examen ${i}` : `Consulta ${i}`;
      servidor.enviar(new Correo(ana, asunto, "Texto", [beto]));
    }

    const buzonBeto = servidor.buzonDe("beto@ucp.edu.ar");
    expect(buzonBeto.listar("entrada")).toHaveLength(100);

    // Filtramos la Entrada de Beto por asunto
    const examenes = new Filtro("Exámenes", asuntoContiene("examen"));
    const resultado = buzonBeto.aplicarFiltro(examenes, "entrada");

    expect(resultado).toHaveLength(10);
    expect(resultado.every((c) => c.getAsunto().startsWith("Examen"))).toBe(true);

    // Filtrar no modifica la bandeja: siguen estando los 100
    expect(buzonBeto.listar("entrada")).toHaveLength(100);
  });
});