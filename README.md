# WICK'D — Smooth. Potent. Premium.

Sitio de la marca con sus cuatro líneas (THC Badder, Indoor Exotic Duo, Diamond
Infused Trio y Hashhole Tubes), los reportes de laboratorio de cada lote y un
panel para administrarlo todo.

| Ruta | Qué es |
|---|---|
| `/` | Home: el sabor elegido pinta todo el sitio, las cuatro líneas, la jeringa de THC Badder que se llena, la caja de Hashhole en 3D, las 24 variedades, buscador de lote y muro de stickers |
| `/products` | Las 24 variedades, con filtro por línea (`?line=thc-badder`), tipo (`?type=indica`) y búsqueda |
| `/products/:slug` | Una variedad: foto del pouch o tubo y del display, ficha de la etiqueta, reportes y los demás sabores de la línea |
| `/lab-reports` | Todos los reportes, con búsqueda por lote o sabor (`?q=WCD05252025`) y visor de PDF en la página |
| `/about` | About Us |
| `/contact` | Contact Us: formulario (acepta `?topic=Lab%20report`) y datos de la empresa |
| `/admin` | Panel: lab reports, productos, videos, mensajes, newsletter, datos de contacto, admins |

El sitio pide confirmar 21+ en la primera visita (se recuerda en el dispositivo).

## Stack

React 19 + Vite + wouter · tRPC 11 + Express · Drizzle ORM + MySQL ·
Cloudflare R2 (o el volumen de Railway) · Tailwind 4 · three.js para la caja
3D · Railway. Fugaz One y Montserrat autoalojadas.

## Diseño

Sale de los empaques: el espacio y las nebulosas de cada pouch, el logo blanco
con contorno negro tipo sticker, las nubes, el dorado del badder y **un color por
sabor**. Cada producto guarda su color (`accentColor`) y, al verlo, todo el sitio
lo toma a través de la variable CSS `--accent`: el fondo de estrellas
(`Starfield.tsx`), los botones, la cinta de texto y los bordes.

- Logo vectorizado del arte original: `client/public/brand/logo.svg`.
- Fotos de producto recortadas sin fondo: `client/public/products/<slug>.webp`
  (pouch o tubo) y `<slug>-box.webp` (display). En THC Badder la principal es el
  display de 5 porque es la toma más nítida, y la segunda es el pouch.
- Caja de Hashhole 3D: `client/public/models/hashhole-box.glb`. Siempre mira de
  frente: se balancea sola y al arrastrarla gira un poco y vuelve.
- Las animaciones se detienen con `prefers-reduced-motion`.

---

## Variables de entorno

| Variable | Para qué | Obligatoria |
|---|---|---|
| `DATABASE_URL` | MySQL. En Railway: `${{MySQL.MYSQL_URL}}`. También sirve `MYSQL_URL` (la que usaba el sitio anterior) | Sí |
| `JWT_SECRET` | Firma de la sesión del admin. Larga y aleatoria | Sí |
| `ADMIN_SETUP_TOKEN` | Secreto para crear el **primer** admin. Borrarla después | Sí, al inicio |
| `DATA_DIR` | Carpeta del volumen de Railway (p. ej. `/app/data`). Sin R2, los archivos que subas desde el panel se guardan ahí | Si no hay R2 |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` | Cloudflare R2. Si están, tienen prioridad sobre el volumen | No |
| `SEED_CATALOG` | `true` vuelve a cargar el catálogo que falte. No hace falta en el primer deploy | No |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Aviso por email de los mensajes de contacto | No |
| `CONTACT_TO_EMAIL` | Solo si los avisos deben ir a otro correo que el de Contact details | No |

Sin R2 ni `DATA_DIR` el sitio funciona igual; lo único que no se puede es
**subir** archivos desde el panel (los reportes se pueden enlazar por URL).

## Primer arranque

En cada arranque se aplican las migraciones (`server/migrate.ts`). Si la tabla de
productos está vacía, se cargan solas las **24 variedades** con sus fotos y los
**18 reportes** de ACS Laboratory (Duo, Trio y Tubes; los de THC Badder se suben
desde el panel). El seed nunca toca productos que ya existen.

Si la base es la del sitio anterior de WICK'D (tablas `wickd_*`), en ese primer
arranque se copian también sus **mensajes** y **suscriptores**. Las tablas viejas
no se modifican.

## Desplegar en Railway

### Opción A: el servicio que ya existe

1. Servicio de la web → **Settings → Source** → conectar
   `georgemontilva-crypto/wicked-web`, rama `main`.
2. **Variables**: dejar `MYSQL_URL` y `DATA_DIR` como están y agregar
   `JWT_SECRET` y `ADMIN_SETUP_TOKEN`. `ADMIN_PASSWORD`, `SESSION_SECRET` y
   `APP_ORIGIN` ya no se usan y se pueden borrar.
3. Esperar el deploy. En los logs debe salir `[Migrations] Database is up to
   date.` y `[Seed] Done. 24 product(s) added.`

### Opción B: proyecto nuevo

1. **New Project → Deploy from GitHub repo** → `wicked-web`.
2. **New → Database → MySQL**.
3. Variables del servicio web: `DATABASE_URL=${{MySQL.MYSQL_URL}}`,
   `JWT_SECRET`, `ADMIN_SETUP_TOKEN` y, si no hay R2, un **volumen** montado en
   `/app/data` con `DATA_DIR=/app/data`.
4. **Settings → Networking → Generate Domain**.

En los dos casos, después del deploy: abrir `https://TU-DOMINIO/admin/login`,
pegar el `ADMIN_SETUP_TOKEN`, crear la cuenta y borrar esa variable.

`railway.json` fija el builder en Railpack (`pnpm build` / `pnpm start`), así
que el Dockerfile del sitio anterior ya no se usa.

---

## Uso del panel

- **Lab Reports**: elegir la variedad, escribir el **lote tal como está impreso**
  (p. ej. `WCD05252025`; los clientes buscan por él) y subir el PDF.
- **Products**: nombre, línea, tipo, color, formato, ficha (una línea por dato,
  `Etiqueta: valor`) y dos fotos (mejor en WebP o PNG sin fondo).
- **Videos**: clips verticales MP4. El de la estrella sale grande; los demás en
  "On camera" del Home.
- **Messages**: lo que llega por Contact Us.
- **Newsletter**: los correos inscritos, con **Export CSV**.
- **Contact details**: empresa, email, teléfono, dirección e Instagram del pie y
  de Contact Us (vacíos no se muestran).

### QR de los empaques

- `https://TU-DOMINIO/lab-reports?q=WCD05252025` (por lote)
- `https://TU-DOMINIO/lab-reports?q=Blue%20Magic` (por sabor)

---

## Desarrollo local

```bash
pnpm install
cp .env.example .env      # y rellenar
pnpm dev                  # http://localhost:3000
pnpm check                # tsc --noEmit
pnpm test                 # vitest (incluye que cada foto y PDF del seed exista)
pnpm build
```

### Cambiar el esquema

No usar `drizzle-kit push`. Editar `drizzle/schema.ts` y generar el SQL:

```bash
DATABASE_URL="mysql://x:y@localhost:3306/z" npx drizzle-kit generate --name descripcion
```

Commitear el `.sql` con el cambio; el siguiente deploy lo aplica solo.

## Dónde está cada cosa

| | |
|---|---|
| `client/public/products/` | 48 fotos recortadas (24 principales + 24 displays) |
| `client/public/coa/` | Los 18 PDF de ACS Laboratory |
| `client/public/brand/` | Logo SVG, favicons, sellos, borde rasgado |
| `client/src/index.css` | Sistema visual |
| `shared/lines.ts` | Las cuatro líneas: orden, formato y texto |
| `server/seed.ts` | Las 24 variedades y los 18 reportes |
| `drizzle/schema.ts` | Tablas |
