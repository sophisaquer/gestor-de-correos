import { describe, it, expect } from "vitest";
import { ServidorDeCorreos } from "../src/ServidorDeCorreos";
import { GestorDeCorreos } from "../src/GestorDeCorreos";
import { GestorDeFiltros } from "../src/GestorDeFiltros";
import { Filtro } from "../src/Filtro";
import { Agenda } from "../src/Agenda";
import { Correo } from "../src/Correo";
import { Contacto } from "../src/Contacto";
import { and, or, not, noLeido, delDominio, asuntoContiene } from "../src/Predicados";
import { correosAcademicosImportantes } from "../src/FiltrosComplejos";
import { asuntos, correosQueCumplen, cantidadNoLeidos, cantidadPorRemitente } from "../src/Estadisticas";

const ana = new Contacto("Ana", "ana@ucp.edu.ar");
const beto = new Contacto("Beto", "beto@ucp.edu.ar");
const caro = new Contacto("Caro", "caro@gmail.com");

function servidorConUsuarios(): ServidorDeCorreos {
  const servidor = new ServidorDeCorreos();
  [ana, beto, caro].forEach((u) => servidor.registrar(u));
  return servidor;
}

describe("RF-01 · Creación de correos electrónicos", () => {
  it("crea un correo con remitente, asunto, cuerpo y destinatarios", () => {
    const correo = new Correo(ana, "Examen", "El lunes a las 8", [beto, caro]);
    expect(correo.getRemitente()).toBe(ana);
    expect(correo.getAsunto()).toBe("Examen");
    expect(correo.getCuerpo()).toBe("El lunes a las 8");
    expect(correo.getDestinatarios()).toEqual([beto, caro]);
  });

  it("cada correo tiene su propio id", () => {
    expect(new Correo(ana).getId()).not.toBe(new Correo(ana).getId());
  });
});

describe("RF-02 · Envío de correos electrónicos", () => {
  it("queda en Enviados del remitente y llega a la Entrada de cada destinatario", () => {
    const servidor = servidorConUsuarios();
    const correo = new Correo(ana, "Reunión", "Mañana a las 10", [beto, caro]);
    servidor.enviar(correo);

    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("enviados")).toEqual([correo]);
    expect(servidor.buzonDe("beto@ucp.edu.ar").listar("entrada")).toHaveLength(1);
    expect(servidor.buzonDe("caro@gmail.com").listar("entrada")).toHaveLength(1);
  });

  it("dos correos de distintos remitentes a los mismos destinatarios llegan los dos", () => {
    const servidor = servidorConUsuarios();
    servidor.enviar(new Correo(ana, "De Ana", "", [caro]));
    servidor.enviar(new Correo(beto, "De Beto", "", [caro]));

    const asuntosDeCaro = servidor.buzonDe("caro@gmail.com").listar("entrada").map((c) => c.getAsunto());
    expect(asuntosDeCaro).toEqual(["De Ana", "De Beto"]);
  });

  it("si un destinatario elimina el correo, los demás lo siguen teniendo", () => {
    const servidor = servidorConUsuarios();
    servidor.enviar(new Correo(ana, "Aviso", "", [beto, caro]));

    const buzonBeto = servidor.buzonDe("beto@ucp.edu.ar");
    buzonBeto.eliminar(buzonBeto.listar("entrada")[0]);

    expect(servidor.buzonDe("caro@gmail.com").listar("entrada")).toHaveLength(1);
    expect(servidor.buzonDe("ana@ucp.edu.ar").listar("enviados")).toHaveLength(1);
  });
});

describe("RF-03 · Gestión de contactos", () => {
  it("agrega, busca, modifica y elimina contactos", () => {
    const agenda = new Agenda();
    agenda.agregar(new Contacto("Ana", "ana@ucp.edu.ar"));
    agenda.agregar(new Contacto("Beto", "beto@ucp.edu.ar"));

    expect(agenda.buscarPorEmail("ANA@ucp.edu.ar")?.getNombre()).toBe("Ana");
    agenda.modificarNombre("ana@ucp.edu.ar", "Ana María");
    expect(agenda.buscarPorNombre("maría")).toHaveLength(1);
    agenda.eliminar("beto@ucp.edu.ar");
    expect(agenda.cantidad()).toBe(1);
  });

  it("no permite contactos con datos inválidos ni emails repetidos", () => {
    const agenda = new Agenda();
    agenda.agregar(new Contacto("Ana", "ana@ucp.edu.ar"));
    expect(() => agenda.agregar(new Contacto("Otra Ana", "ana@ucp.edu.ar"))).toThrow();
    expect(() => new Contacto("", "x@ucp.edu.ar")).toThrow();
    expect(() => new Contacto("Juan", "sin-arroba")).toThrow();
  });
});

describe("RF-04 · Búsqueda de correos electrónicos", () => {
  it("busca en la Entrada por texto libre en cualquier campo", () => {
    const gestor = new GestorDeCorreos(beto);
    gestor.recibir(new Correo(ana, "Examen final", "", [beto]));
    gestor.recibir(new Correo(caro, "Hola", "¿Vamos al cine?", [beto]));

    expect(gestor.buscar("examen")).toHaveLength(1);
    expect(gestor.buscar("cine")).toHaveLength(1);
    expect(gestor.buscar("caro@")).toHaveLength(1);
    expect(gestor.buscar("nada")).toEqual([]);
  });
});

describe("RF-05 · Creación y aplicación de filtros personalizados", () => {
  it("combina condiciones con and, or y not", () => {
    const gestor = new GestorDeCorreos(beto);
    const examen = new Correo(ana, "Examen", "", [beto]);
    const proyecto = new Correo(caro, "Proyecto", "", [beto]);
    gestor.recibir(examen);
    gestor.recibir(proyecto);
    proyecto.marcarComoLeido();

    const filtro = new Filtro(
      "Facultad o proyecto sin leer",
      and(or(delDominio("ucp.edu.ar"), asuntoContiene("Proyecto")), not((c: Correo) => c.estaLeido())),
    );
    expect(gestor.aplicarFiltro(filtro, "entrada")).toEqual([examen]);
  });

  it("guarda hasta cinco filtros y los reutiliza", () => {
    const filtros = new GestorDeFiltros();
    filtros.registrar(correosAcademicosImportantes());
    ["a", "b", "c", "d"].forEach((n) => filtros.registrar(new Filtro(n, noLeido)));
    expect(() => filtros.registrar(new Filtro("sexto", noLeido))).toThrow();

    const gestor = new GestorDeCorreos(beto);
    gestor.recibir(new Correo(ana, "Examen parcial", "", [beto]));
    const academicos = filtros.buscar("Correos académicos importantes")!;
    expect(gestor.aplicarFiltro(academicos, "entrada")).toHaveLength(1);
  });
});

describe("RF-06 · Gestión de bandejas y clasificación", () => {
  it("cada usuario tiene sus cuatro bandejas", () => {
    const gestor = new GestorDeCorreos(ana);
    for (const tipo of ["entrada", "enviados", "borradores", "eliminados"] as const) {
      expect(gestor.listar(tipo)).toEqual([]);
    }
  });

  it("al eliminar va a Eliminados y al restaurar vuelve a su bandeja", () => {
    const gestor = new GestorDeCorreos(beto);
    const correo = new Correo(ana, "Hola", "", [beto]);
    gestor.recibir(correo);

    gestor.eliminar(correo);
    expect(gestor.bandejaDe(correo)).toBe("eliminados");
    gestor.restaurar(correo);
    expect(gestor.bandejaDe(correo)).toBe("entrada");
  });
});

describe("RF-07 · Gestión de borradores", () => {
  it("guarda un borrador incompleto, lo edita y al enviarlo pasa a Enviados", () => {
    const gestor = new GestorDeCorreos(ana);
    const borrador = new Correo(ana);
    gestor.guardarBorrador(borrador);

    gestor.editarBorrador(borrador, { asunto: "Consulta", agregarDestinatarios: [beto] });
    gestor.enviar(borrador);

    expect(gestor.listar("borradores")).toEqual([]);
    expect(gestor.listar("enviados")).toEqual([borrador]);
  });

  it("un borrador inválido no se envía", () => {
    const gestor = new GestorDeCorreos(ana);
    const borrador = new Correo(ana, "", "Sin asunto ni destinatarios");
    gestor.guardarBorrador(borrador);

    expect(() => gestor.enviar(borrador)).toThrow();
    expect(gestor.bandejaDe(borrador)).toBe("borradores");
  });
});

describe("RF-08 · Marcar correos como leídos o no leídos", () => {
  it("cambia el estado de lectura y lista los no leídos", () => {
    const gestor = new GestorDeCorreos(beto);
    const primero = new Correo(ana, "Uno", "", [beto]);
    const segundo = new Correo(ana, "Dos", "", [beto]);
    gestor.recibir(primero);
    gestor.recibir(segundo);

    primero.marcarComoLeido();
    expect(gestor.noLeidos("entrada")).toEqual([segundo]);
    primero.marcarComoNoLeido();
    expect(gestor.noLeidos("entrada")).toHaveLength(2);
  });
});

describe("RF-09 · Gestión de correos favoritos", () => {
  it("marca y desmarca favoritos y los muestra en una vista aparte", () => {
    const gestor = new GestorDeCorreos(ana);
    const recibido = new Correo(beto, "Recibido", "", [ana]);
    const enviado = new Correo(ana, "Enviado", "", [beto]);
    gestor.recibir(recibido);
    gestor.enviar(enviado);

    recibido.marcarFavorito();
    enviado.marcarFavorito();
    expect(gestor.favoritos()).toEqual([recibido, enviado]);
    expect(gestor.bandejaDe(recibido)).toBe("entrada");

    enviado.desmarcarFavorito();
    expect(gestor.favoritos()).toEqual([recibido]);
  });
});

describe("RF-10 · Procesamiento funcional y estadísticas", () => {
  it("obtiene asuntos, filtra y cuenta con map, filter y reduce", () => {
    const correos = [
      new Correo(ana, "Examen", "", [beto]),
      new Correo(ana, "Notas", "", [beto]),
      new Correo(caro, "Cine", "", [beto]),
    ];
    correos[0].marcarComoLeido();

    expect(asuntos(correos)).toEqual(["Examen", "Notas", "Cine"]);
    expect(correosQueCumplen(correos, delDominio("ucp.edu.ar"))).toHaveLength(2);
    expect(cantidadNoLeidos(correos)).toBe(2);
    expect(cantidadPorRemitente(correos).get("ana@ucp.edu.ar")).toBe(2);
  });
});
