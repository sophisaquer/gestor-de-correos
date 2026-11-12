import type { Correo } from "./Correo";
import type { Contacto } from "./Contacto";
import { GestorDeCorreos } from "./GestorDeCorreos";

export class ServidorDeCorreos {
  private readonly buzones = new Map<string, GestorDeCorreos>();

  registrar(usuario: Contacto): GestorDeCorreos {
    if (this.buzones.has(usuario.getEmail())) {
      throw new Error("Ya existe un buzón para ese email");
    }
    const buzon = new GestorDeCorreos(usuario);
    this.buzones.set(usuario.getEmail(), buzon);
    return buzon;
  }

  buzonDe(email: string): GestorDeCorreos {
    const buzon = this.buzones.get(email.trim().toLowerCase());
    if (!buzon) {
      throw new Error("No existe un buzón para ese email");
    }
    return buzon;
  }

  enviar(correo: Correo): void {
    const buzonRemitente = this.buzonDe(correo.getRemitente().getEmail());
    const buzonesDestino = correo.getDestinatarios().map((d) => this.buzonDe(d.getEmail()));
    buzonRemitente.enviar(correo);
    buzonesDestino.forEach((buzon) => buzon.recibir(correo.copiar()));
  }
}