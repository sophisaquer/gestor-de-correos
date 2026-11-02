export class Contacto {
  private nombre: string;
  private readonly email: string;

  constructor(nombre: string, email: string) {
    this.nombre = nombre;
    this.email = email;
  }

  getNombre(): string {
    return this.nombre;
  }

  getEmail(): string {
    return this.email;
  }
}