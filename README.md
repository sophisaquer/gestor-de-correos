# Gestor de Correos

Este es nuestro trabajo práctico AE4 de Paradigmas y Lenguajes de Programación II, en la UCP.

La idea es simular un cliente de correo, parecido a Gmail pero sin pantallas: todo se maneja desde el código y lo comprobamos con tests.

Lo hicimos entre Sophia Saquer y Alfredo de la Cruz.

## Qué hace

Cada usuario tiene su propio buzón, con su bandeja de entrada, enviados, borradores y eliminados.

Se pueden guardar contactos en una agenda, escribir correos, dejarlos como borrador para terminarlos después y enviarlos. Cuando alguien envía un correo, le queda en sus enviados y a cada destinatario le llega una copia a su bandeja de entrada.

Los correos se pueden marcar como leídos o como favoritos, eliminar y recuperar, y buscar por cualquier palabra que tengan. También se pueden armar filtros para encontrar ciertos correos, por ejemplo los que mandó la facultad y hablan de un examen, y sacar algunas estadísticas, como cuántos correos sin leer hay o cuántos mandó cada persona.

## Cómo probarlo

Necesitás tener instalado [Node.js](https://nodejs.org/). Después, en la carpeta del proyecto:

```bash
npm install
npm test
```

El primer comando instala lo necesario y el segundo corre todos los tests.

## Cómo lo hicimos

Lo organizamos en tres sprints y fuimos anotando las tareas en el tablero del repositorio. Para cada parte escribimos primero los tests y después el código, así que en el historial vas a ver que casi todo aparece en dos commits.
