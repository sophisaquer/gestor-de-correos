import { Contacto } from "./Contacto";

export class Correo {
  private static siguienteId = 1;

  private readonly id: number;
  private readonly remitente: Contacto;
  private asunto: string;
  private cuerpo: string;
  private destinatarios: Contacto[] = [];
  private leido = false;
  private favorito = false;

  constructor(remitente: Contacto, asunto = "", cuerpo = "", destinatarios: Contacto[] = []) {
    this.id = Correo.siguienteId++;
    this.remitente = remitente;
    this.asunto = asunto;
    this.cuerpo = cuerpo;
    destinatarios.forEach((d) => this.agregarDestinatario(d));
  }

  getId(): number {
    return this.id;
  }

  getRemitente(): Contacto {
    return this.remitente;
  }

  getAsunto(): string {
    return this.asunto;
  }

  setAsunto(asunto: string): void {
    this.asunto = asunto;
  }

  getCuerpo(): string {
    return this.cuerpo;
  }

  setCuerpo(cuerpo: string): void {
    this.cuerpo = cuerpo;
  }

  getDestinatarios(): Contacto[] {
    return [...this.destinatarios];
  }

  agregarDestinatario(contacto: Contacto): void {
    if (this.tieneDestinatario(contacto.getEmail())) {
      throw new Error("El destinatario ya está en el correo");
    }
    this.destinatarios.push(contacto);
  }

  quitarDestinatario(email: string): void {
    if (!this.tieneDestinatario(email)) {
      throw new Error("El destinatario no está en el correo");
    }
    const buscado = email.trim().toLowerCase();
    this.destinatarios = this.destinatarios.filter((d) => d.getEmail() !== buscado);
  }

  estaLeido(): boolean {
    return this.leido;
  }

  marcarComoLeido(): void {
    this.leido = true;
  }

  marcarComoNoLeido(): void {
    this.leido = false;
  }

  esFavorito(): boolean {
    return this.favorito;
  }

  marcarFavorito(): void {
    this.favorito = true;
  }

  desmarcarFavorito(): void {
    this.favorito = false;
  }

  copiar(): Correo {
    return new Correo(this.remitente, this.asunto, this.cuerpo, this.destinatarios);
  }

  esValidoParaEnviar(): boolean {
    return this.asunto.trim() !== "" && this.destinatarios.length > 0;
  }

  private tieneDestinatario(email: string): boolean {
    const buscado = email.trim().toLowerCase();
    return this.destinatarios.some((d) => d.getEmail() === buscado);
  }
}