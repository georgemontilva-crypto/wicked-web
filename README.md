# WICK’D — Visual Archive

Sitio informativo completo de catálogo visual, construido con Next.js, React y Three.js. Diseño blanco con superficies glass, escultura 3D interactiva y administrador con almacenamiento real en el servidor.

## Contenido

- HOME: banner editable, objeto 3D con rotación, desplazamiento, zoom y controles de teclado. Se puede reemplazar por un GLB autocontenido desde el administrador.
- ABOUT US: textos e imagen editables.
- CONTACT US: formulario validado que guarda mensajes en la bandeja privada del administrador. No envía correos automáticamente.
- PRODUCTS: ocho familias, 48 variantes y 90 imágenes del material suministrado. Filtros, búsqueda, muestras de color, fichas, galerías y enlaces por variante.
- LAB REPORTS: biblioteca de PDFs originales asociados a producto, variante y lote. No se incluyeron informes ficticios: los archivos suministrados contienen imágenes de envases.
- ADMIN: acceso protegido, contenido y navegación editables, creación/edición/eliminación de familias y variantes, carga de imágenes/GLB/PDF, borradores, publicación e inbox.

Los textos públicos iniciales están en inglés, siguiendo el menú solicitado. Se pueden editar desde el administrador. Este proyecto es un archivo informativo; no implementa compras, precios, pedidos ni distribución.

## Ejecutar localmente

Requisitos: Node.js 24 y npm.

1. Ejecutar `npm ci`.
2. Copiar `.env.example` a `.env.local`.
3. Configurar `ADMIN_PASSWORD` con una contraseña fuerte y `SESSION_SECRET` con al menos 32 caracteres aleatorios.
4. Ejecutar `npm run dev`.
5. Abrir `http://localhost:3000` y `http://localhost:3000/admin`.

Las credenciales locales creadas durante la entrega están fuera del repositorio. Nunca subir `.env.local` ni la carpeta `data` a GitHub.

## Publicar en Railway

El repositorio incluye Dockerfile y railway.json. Crear un servicio desde este repositorio; Railway detectará el Dockerfile.

Configurar estas variables en el servicio:

| Variable | Valor |
|---|---|
| `ADMIN_PASSWORD` | Contraseña privada del administrador |
| `SESSION_SECRET` | Secreto aleatorio de al menos 32 caracteres |
| `DATA_DIR` | `/app/data` |
| `APP_ORIGIN` | URL HTTPS pública exacta, sin barra final |

**Conectar un volumen persistente en `/app/data`** para conservar contenido, imágenes, modelos, documentos y mensajes después de reinicios o nuevos despliegues. El volumen debe permitir escritura al UID/GID 1001 del contenedor. Utilizar **una sola réplica**: el archivo JSON usa cola de escritura compartida y reemplazo atómico dentro de un proceso. Para múltiples instancias, migrar el almacenamiento a una base de datos y un servicio de objetos compartidos.

El contenedor respeta `PORT`, escucha en `0.0.0.0` y tiene comprobación de salud en `/api/health`. La ausencia de credenciales bloquea el acceso de administrador; nunca hay una contraseña pública por defecto.

Sin un volumen, los cambios en el administrador no son duraderos entre despliegues. Hacer copias de seguridad del volumen para conservar el catálogo y los archivos.

## Flujo de edición

1. Entrar en `/admin`.
2. Editar textos, familias, variantes o documentos.
3. En los diálogos, pulsar **Apply changes**.
4. Pulsar **Publish changes** para guardar y publicar todo el borrador.

Cada variante requiere al menos una imagen. Los reportes publicados requieren PDF, producto, lote, laboratorio y fecha. Los archivos cargados quedan privados mientras no estén referenciados por contenido público. Eliminar un registro conserva sus archivos en el volumen.

Los envases son imágenes suministradas, no modelos 3D. El banner inicial usa una escultura cromada abstracta; el administrador permite sustituirla por un modelo GLB real con texturas embebidas.

## Validación y seguridad

- `npm run build`: compilación de producción y verificación TypeScript.
- Sesión firmada de ocho horas, cookie HttpOnly/SameSite y cookie Secure en producción.
- Verificación de origen en operaciones de escritura, límites de acceso y formulario con protección básica contra spam.
- Validación de contenido, revisión optimista para evitar sobreescribir cambios concurrentes y carga de archivos con comprobación de formato y tamaño.
- No hay analíticas externas, claves en el cliente ni resultados de laboratorio inventados.

La información de las etiquetas es transcripción del material suministrado. No sustituye análisis independientes ni demuestra composición, efectos o cumplimiento legal.

## MySQL storage on Railway

1. Add a MySQL database service **inside the existing WICKD project and production environment**.
2. In the WICKD application's Variables, set `MYSQL_URL=${{MySQL.MYSQL_URL}}` (replace `MySQL` if the database service has another name). Use the private URL reference, not the public proxy URL.
3. Keep the existing application volume and `DATA_DIR` unchanged. Uploaded images/PDFs/GLBs are still files on that volume. The migration reads `DATA_DIR/catalog.json` when present.
4. Deploy/redeploy WICKD after MySQL is running. The first storage access creates the MySQL tables and imports the catalog once. It saves a `catalog-before-mysql-*.json` backup on the application volume. Later deployments never import over an existing MySQL catalog.
5. Verify `/api/health` returns `{"status":"ok","storage":"mysql"}` and check products, admin, messages, and newsletter CSV export. Migration logs contain counts only, never credentials or email addresses.

Tables: `wickd_catalog_state`, `wickd_products`, `wickd_reports`, `wickd_messages`, and `wickd_subscribers`. Entries are separate rows with JSON payloads; subscriber emails have a unique database index. Updates run inside an InnoDB transaction, with the catalog revision locked to serialize concurrent admin/contact/newsletter updates.

Local development can omit `MYSQL_URL` to retain JSON storage. When `MYSQL_URL` is configured, connection failures fail explicitly; there is no silent fallback to a second data store. Configure database backups in Railway separately. To revert after new MySQL writes, export the current database first: the retained JSON file is a migration-time snapshot, not a live mirror.

Never commit a real database URL or password. Optional `MYSQL_SSL=true` enables verified TLS for providers that require it; Railway private networking normally uses its default connection configuration.
# Contact email via SMTP

Contact messages are always saved in the admin Inbox first. Optional SMTP delivery sends the same message as a styled HTML email plus a plain-text alternative. Reply-To points to the visitor. Failed or unconfigured delivery does not discard the message; its status appears in Inbox. Previously saved messages are not automatically sent.

Set the private recipient in Admin → Content → Contact us and save changes. The public contact email is a separate setting. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and SMTP_FROM to the server environment (see .env.example). SMTP_FROM must be a plain sender email authorized by the provider. Port 587 requires STARTTLS; 465 uses implicit TLS. Credentials stay on the server. Restart after changing environment variables, then submit a test contact message and check Inbox and the recipient mailbox.

Railway Free, Trial and Hobby block outbound SMTP. Use a hosting plan that permits SMTP before testing production delivery. No email provider account is bundled or configured by this project.
