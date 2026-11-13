import { Filtro } from "./Filtro";

export class GestorDeFiltros {
  private static readonly MAXIMO = 5;
  private filtros: Filtro[] = [];

  registrar(filtro: Filtro): void {
    if (this.filtros.length >= GestorDeFiltros.MAXIMO) {
      throw new Error("No se pueden registrar más de 5 filtros");
    }
    if (this.buscar(filtro.getNombre()) !== undefined) {
      throw new Error("Ya existe un filtro con ese nombre");
    }
    this.filtros.push(filtro);
  }

  buscar(nombre: string): Filtro | undefined {
    const buscado = nombre.trim().toLowerCase();
    return this.filtros.find((f) => f.getNombre().toLowerCase() === buscado);
  }

  listar(): Filtro[] {
    return [...this.filtros];
  }

  cantidad(): number {
    return this.filtros.length;
  }
}