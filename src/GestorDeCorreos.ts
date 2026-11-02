import { Bandeja, type TipoBandeja } from "./Bandeja";
import { Correo } from "./Correo";

export class GestorDeCorreos {
  private readonly bandejas = new Map<TipoBandeja, Bandeja>([
    ["entrada", new Bandeja("entrada")],
    ["enviados", new Bandeja("enviados")],
    ["borradores", new Bandeja("borradores")],
    ["eliminados", new Bandeja("eliminados")],
  ]);
  private readonly origenDeEliminados = new Map<number, TipoBandeja>();

  listar(tipo: TipoBandeja): Correo[] {
    return this.bandeja(tipo).listar();
  }

  bandejaDe(correo: Correo): TipoBandeja | undefined {
    for (const bandeja of this.bandejas.values()) {
      if (bandeja.contiene(correo)) {
        return bandeja.getTipo();
      }
    }
    return undefined;
  }

  recibir(correo: Correo): void {
    this.validarQueNoEsteEnElGestor(correo);
    this.bandeja("entrada").agregar(correo);
  }

  guardarBorrador(correo: Correo): void {
    this.validarQueNoEsteEnElGestor(correo);
    this.bandeja("borradores").agregar(correo);
  }

  eliminar(correo: Correo): void {
    const origen = this.bandejaDe(correo);
    if (origen === undefined) {
      throw new Error("El correo no está en ninguna bandeja");
    }
    if (origen === "eliminados") {
      throw new Error("El correo ya está eliminado");
    }
    this.mover(correo, origen, "eliminados");
    this.origenDeEliminados.set(correo.getId(), origen);
  }

  restaurar(correo: Correo): void {
    const origen = this.origenDeEliminados.get(correo.getId());
    if (this.bandejaDe(correo) !== "eliminados" || origen === undefined) {
      throw new Error("Solo se pueden restaurar correos eliminados");
    }
    this.mover(correo, "eliminados", origen);
    this.origenDeEliminados.delete(correo.getId());
  }

  private mover(correo: Correo, desde: TipoBandeja, hasta: TipoBandeja): void {
    this.bandeja(desde).quitar(correo);
    this.bandeja(hasta).agregar(correo);
  }

  private validarQueNoEsteEnElGestor(correo: Correo): void {
    if (this.bandejaDe(correo) !== undefined) {
      throw new Error("El correo ya está en una bandeja");
    }
  }

  private bandeja(tipo: TipoBandeja): Bandeja {
    return this.bandejas.get(tipo)!;
  }
}