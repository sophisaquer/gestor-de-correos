import { Contacto } from "./Contacto";

export class Agenda {
    private contactos: Map<string, Contacto> = new Map();

    agregar(contacto: Contacto): void {
        const email = contacto.getEmail();
        if (this.contactos.has(email)) {
            throw new Error("Ya existe un contacto con ese email");
        }
        this.contactos.set(email, contacto);
    }

    eliminar(email: string): void {
        const clave = Agenda.normalizarEmail(email);
        if (!this.contactos.delete(clave)) {
            throw new Error("No existe un contacto con ese email");
        }
    }

    modificarNombre(email: string, nuevoNombre: string): void {
        const contacto = this.buscarPorEmail(email);
        if (!contacto) {
            throw new Error("No existe un contacto con ese email");
        }
        contacto.setNombre(nuevoNombre);
    }

    buscarPorEmail(email: string): Contacto | undefined {
        return this.contactos.get(Agenda.normalizarEmail(email));
    }

    buscarPorNombre(texto: string): Contacto[] {
        const buscado = texto.trim().toLowerCase();
        return this.listar().filter((c) =>
            c.getNombre().toLowerCase().includes(buscado)
        );
    }

    listar(): Contacto[] {
        return [...this.contactos.values()];
    }

    cantidad(): number {
        return this.contactos.size;
    }

    private static normalizarEmail(email: string): string {
        return email.trim().toLowerCase();
    }
}