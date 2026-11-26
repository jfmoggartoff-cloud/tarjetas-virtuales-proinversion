# Tarjetas virtuales · PROINVERSIÓN (DSI)

> **Repositorio público de demostración.** Incluye datos de contacto reales de la Gerenta General (celular, foto y biografía) publicados con autorización, además de archivos de marca y la tipografía Univia Pro de PROINVERSIÓN. Si alguno de estos elementos deja de estar autorizado, retíralo del repositorio **y de su historial**: borrar solo el archivo no basta.

## Demostración en línea (GitHub Pages)

Con Pages activado (Settings → Pages → *Deploy from a branch* → `main` / *root*):

| Página | Dirección |
|---|---|
| Portada | `https://<usuario>.github.io/tarjetas-virtuales-proinversion/` |
| Equipo (todas las tarjetas) | `https://<usuario>.github.io/tarjetas-virtuales-proinversion/prototipo/` |
| Tarjeta de una persona | `https://<usuario>.github.io/tarjetas-virtuales-proinversion/prototipo/<nombre-apellido>/` (ej. `…/prototipo/mirtha-razuri/`) |
| Panel | `https://<usuario>.github.io/tarjetas-virtuales-proinversion/prototipo/admin/` (cualquier usuario y contraseña) |

En GitHub Pages el QR de la tarjeta apunta a su propia dirección de Pages, así que se puede escanear en una reunión. En el servidor real apuntará a `investinperu.pe`.

Aplicación para crear **tarjetas de contacto virtuales** de los funcionarios de PROINVERSIÓN, con el estilo del Manual de Identidad Institucional:

- **Tarjeta pública** (una URL por funcionario, pensada primero para celular en vertical; también funciona en horizontal y en computadora): foto, cargo, biografía corta, accesos rápidos (llamar, WhatsApp, correo, ubicación), **Ver QR**, **Compartir** y **Guardar contacto** (vCard con todos los datos visibles y la foto). Bilingüe ES/EN, con español por defecto.
- **Panel de administración privado**: panel de estadísticas (vistas, contactos guardados, conversión, escaneos de QR, origen, dispositivos, países), gestión de tarjetas (crear, editar, desactivar o reactivar, QR en SVG/PNG), datos comunes, historial de cambios y carga masiva desde Excel (fase 2).

## Estado (20 nov. 2026)

| Pieza | Estado |
|---|---|
| Tarjeta pública | Prototipo terminado, con 20 funcionarios reales generados desde el Excel |
| Panel de administración | Prototipo navegable con las 20 tarjetas. **Los cambios se guardan en el navegador y las estadísticas son simuladas** |
| Publicación de prueba | `publicar/LEEME-TI.txt`: versión estática de la tarjeta para `investinperu.pe/tarjeta/mirtha-razuri/` (el ZIP se regenera) |
| Sistema real (fase 1) | Pendiente: backend PHP 8.1 + MySQL en el servidor de investinperu.pe (Apache/AlmaLinux) |
| Carga masiva desde Excel (fase 2) | Diseñada en el panel; falta la lectura real del Excel |

## Contenido

```
index.html                     Portada de la demostración (enlaces a la tarjeta y al panel)
prototipo/                     Lo que se ve en el navegador
├── index.html                 Directorio «Equipo PROINVERSIÓN»: todas las tarjetas con su QR y buscador
├── <nombre-apellido>/         Una tarjeta pública por funcionario (20), igual que investinperu.pe/tarjeta/<…>/
├── assets/                    tarjeta.css, tarjeta.js, datos-tarjetas.js, fuentes Univia Pro, logos, fotos optimizadas
└── admin/                     Panel de administración (index.html, admin.css, admin.js)

plantilla-tarjetas.xlsx        Plantilla de carga: hojas Tarjetas, Instrucciones y Datos comunes
fotos/                         Fotos originales; nombre = usuario del correo (mrazuri@… → mrazuri.jpg)
referencias/                   Marca: marca-oficial.md (resumen del manual), logos en SVG,
                               fuentes, logo .ai, manual de firma y pieza impresa de referencia
publicar/LEEME-TI.txt          Instrucciones para que TI publique la versión estática
capturas/                      Capturas de la tarjeta y del panel
herramientas/servidor.ps1      Servidor local de pruebas (PowerShell, sin instalar nada)
herramientas/generar-desde-excel.ps1   Crea o actualiza las tarjetas a partir del Excel y de fotos/
herramientas/plantilla-tarjeta.html    Diseño base de cada tarjeta (lo usa el generador)
```

## Actualizar las tarjetas desde el Excel

1. Edita `plantilla-tarjetas.xlsx` (hoja **Tarjetas**) y coloca las fotos en `fotos/`, con el nombre del usuario del correo (`yrosas@…` → `yrosas.jpg`).
2. Ejecuta:
   ```powershell
   powershell -ExecutionPolicy Bypass -File herramientas\generar-desde-excel.ps1
   ```
3. Se regeneran las páginas `prototipo/<nombre-apellido>/`, las fotos optimizadas y los datos del panel. En el panel, usa «Restablecer datos de prueba» para ver los cambios si ya lo habías abierto en ese navegador.

## Verlo en la computadora

```powershell
powershell -ExecutionPolicy Bypass -File herramientas\servidor.ps1
```

Luego abrir:
- `http://localhost:8766/` → directorio del equipo (todas las tarjetas)
- `http://localhost:8766/mirtha-razuri/` → tarjeta de una persona
- `http://localhost:8766/admin/` → panel (escribir cualquier usuario y contraseña)
- `http://localhost:8766/mirtha-razuri/?demo=1` → tarjeta con panel de pruebas (probar con otra foto o con datos mínimos)

## Enlaces del sistema final

| Enlace | Acceso | Uso |
|---|---|---|
| `investinperu.pe/tarjeta/{nombre-apellido}/` | Público | Tarjeta virtual |
| `investinperu.pe/t/{código}` | Público | Enlace corto dentro del QR. Permite cambiar la tarjeta sin reimprimir el código |
| `investinperu.pe/tarjeta/{…}/contacto.vcf` | Público | Descarga del contacto (se cuenta en las estadísticas) |
| `investinperu.pe/tarjeta/admin/` | **Privado** | Panel, solo desde la red interna |

## Marca
Resumen del manual en `referencias/marca-oficial.md`:
- Colores: rojo `#E1261D` del logo y `#C3261F` para textos y botones; gris `#575756`.
- Tipografía: Univia Pro.
- Barra diagonal ("accent") con ángulo fijo de 55,75°.

El manual completo (`manual-identidad-proinversion.pdf`, 28,7 MB) no se sube porque supera el límite de 25 MB de GitHub web. Se guarda en la carpeta local `referencias/`.

## Pendientes
- TI:
  - acceso SSH/SFTP;
  - base de datos MySQL;
  - confirmar que el filtro de Optical permite POST y subidas;
  - copias de respaldo.
- Confirmar el código postal de la nueva dirección (Calle Manuel Gonzales Olaechea 177).
- Probar el QR con un celular real cuando la tarjeta esté publicada.
- Conformidad por escrito de cada funcionario antes de publicar sus datos (Ley 29733).
- Confirmar con Comunicaciones que la licencia de Univia Pro permite el uso web.

## No se versiona
Los ZIP generados, el manual de identidad completo (por tamaño) y la carpeta `subir-a-github/` (copia temporal para la subida web). Ver `.gitignore`.
