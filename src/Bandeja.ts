import { Correo } from "./Correo";

export type TipoBandeja = "entrada" | "enviados" | "borradores" | "eliminados";

export class Bandeja {
  private readonly tipo: TipoBandeja;
  private correos: Correo[] = [];

  constructor(tipo: TipoBandeja) {
    this.tipo = tipo;
  }

  getTipo(): TipoBandeja {
    return this.tipo;
  }

  agregar(correo: Correo): void {
    if (this.contiene(correo)) {
      throw new Error("El correo ya está en la bandeja");
    }
    this.correos.push(correo);
  }

  quitar(correo: Correo): void {
    if (!this.contiene(correo)) {
      throw new Error("El correo no está en la bandeja");
    }
    this.correos = this.correos.filter((c) => c.getId() !== correo.getId());
  }

  contiene(correo: Correo): boolean {
    return this.correos.some((c) => c.getId() === correo.getId());
  }

  listar(): Correo[] {
    return [...this.correos];
  }

  cantidad(): number {
    return this.correos.length;
  }
}