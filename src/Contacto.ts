export class Contacto {
  private nombre: string;
  private readonly email: string;

  constructor(nombre: string, email: string) {
   this.nombre = Contacto.validarNombre(nombre);
    this.email = email;
  }

  getNombre(): string {
    return this.nombre;
  }

  getEmail(): string {
    return this.email;
  }
    setNombre(nuevoNombre: string): void {
    this.nombre = Contacto.validarNombre(nuevoNombre);
  }
    private static validarNombre(nombre: string): string {
    const limpio = nombre.trim();
    if (limpio === "") {
      throw new Error("El nombre no puede estar vacío");
    }
    return limpio;
  }
}