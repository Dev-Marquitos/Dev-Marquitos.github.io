# Radio Pío XII — Museo virtual interactivo 3D

Museo virtual de **Radio Pío XII**, la emisora del distrito minero **Siglo XX – Catavi** (Llallagua, Potosí, Bolivia), fundada el 1 de mayo de 1959. El sitio reúne historia verificada, objetos reconstruidos en 3D, la red de radios mineras, testimonios, un archivo fotográfico con licencias libres y la **señal en vivo** de la emisora.

Proyecto de la asignatura *Programación Gráfica*, Carrera de Ingeniería Informática, Universidad Nacional “Siglo XX”.
Autor: Marco Antonio Calizaya Laura · Docente guía: Juan Pablo Luna Felipez, Ph.D.

## La experiencia

| Momento | Qué ocurre |
|---|---|
| Entrada | Se “enciende” la radio: zumbido de válvulas, dial de onda corta que busca la emisora entre la estática, código morse y bienvenida del narrador. |
| 01 Inicio | Escena 3D guiada por el scroll: una habitación del campamento, de noche, con la radio, el micrófono, un farol y un guardatojo; por la ventana se ven el castillo minero y la antena. |
| 02 Historia | Línea de tiempo horizontal con 21 hechos documentados (1900 – hoy), con fuente y narración en cada uno. |
| 03 Museo 3D | Rotonda con siete piezas procedurales (receptor, transmisor, micrófono, tocadiscos, guardatojo, carro minero, dinamita), cámara que vuela entre ellas y un recorrido guiado. |
| 04 Red minera | Mapa de Bolivia (Natural Earth) con las radios mineras, vista ampliada del distrito y la animación de la “cadena”. |
| 05 Voces | Personajes, la huelga de hambre de 1977–78, citas literales, programas y obras. |
| 06 Archivo | 18 fotografías con licencia libre, con visor y créditos. |
| 07 En vivo | Señal real (Icecast de ALER) con espectro FFT, vúmetros, oyentes en tiempo real y la “frecuencia memoria”: un dial que sintoniza boletines del pasado. |
| 08 Créditos | Arquitectura, paleta 60-30-10, metodología, fuentes APA 7, licencias y código QR. |
| Salida | “Apagar la radio”: apagado CRT, despedida narrada, créditos y QR. |

Además: asistente “Pregúntale al archivo” (búsqueda BM25 local, también por voz), recorrido guiado automático (modo presentación), subtítulos, música generativa y atajos de teclado (**M** música, **N** narrador, **Esc** detener).

## Tecnología

React 19 · TypeScript · Vite 8 · Three.js r185 · React Three Fiber 9 · Drei · postprocessing · GSAP + ScrollTrigger · Lenis · Framer Motion · Zustand · Tailwind CSS 4 · Web Audio API · Web Speech API.

Todos los modelos de las piezas, las texturas, la música y los efectos de sonido se generan por código. La utilería fotogramétrica proviene de Poly Haven (CC0).

## Uso

```bash
npm install
npm run dev       # desarrollo
npm run build     # compilación de producción en dist/
npm run preview   # sirve dist/ en http://localhost:4173
```

- `?intro=0` en la URL omite la introducción (útil para pruebas y capturas).
- Para la mejor voz del narrador, usar **Microsoft Edge**: ofrece voces neuronales de Bolivia (Marcelo, Sofía).
- La señal en vivo y las estadísticas de oyentes requieren internet; el resto del museo funciona sin conexión.

## Publicación

El flujo `.github/workflows/deploy.yml` compila y publica en GitHub Pages en cada *push* a `main`. En el repositorio hay que activar **Settings → Pages → Source: GitHub Actions**.

## Licencias de recursos

- Fotografías: Wikimedia Commons (dominio público, CC BY y CC BY-SA). Autor y licencia en la sala Archivo y en Créditos.
- Utilería 3D: Poly Haven (CC0). Cartografía: Natural Earth (dominio público). Tipografías: SIL Open Font License.
- Citas: López Vigil, J. I. (1985). *Una mina de coraje*. ALER – Pío XII (CC BY-NC-SA 3.0).
