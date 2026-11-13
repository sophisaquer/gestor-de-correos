import { Correo } from "./Correo";
import type { Predicado } from "./Predicados";

export class Filtro {
  private readonly nombre: string;
  private readonly predicado: Predicado<Correo>;

  constructor(nombre: string, predicado: Predicado<Correo>) {
    const limpio = nombre.trim();
    if (limpio === "") {
      throw new Error("El nombre del filtro no puede estar vacío");
    }
    this.nombre = limpio;
    this.predicado = predicado;
  }

  getNombre(): string {
    return this.nombre;
  }

  getPredicado(): Predicado<Correo> {
    return this.predicado;
  }

  cumple(correo: Correo): boolean {
    return this.predicado(correo);
  }

  aplicar(correos: Correo[]): Correo[] {
    return correos.filter(this.predicado);
  }
}