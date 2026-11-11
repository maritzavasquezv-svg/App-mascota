# ESTADO — Kopeet AI

- Fecha: 9 de noviembre de 2026
- Ficha de avatar: **APROBADA** (FICHA-AVATAR.md)
- Producto: todavía no hay app en código; existe la **vista previa** `vista-previa-app.html` (v7). El rescate de onboarding y paywall se aplica sobre esa vista previa.
- Modelo de monetización decidido: **Modelo 2, primero el onboarding** (vista previa sin cuenta → paywall → registro y pago por Hotmart). Anual US$49,99 (US$4,17/mes), mensual US$6,99, 7 días gratis y garantía Hotmart de 7 días.
- Botón de la página de ventas: lleva a **"Crear el plan de mi perro gratis"** (el onboarding), no directo al pago.

---

## R1 — Lo que hay hoy (solo lectura)

| Tema | Hoy |
|---|---|
| Pantallas de onboarding | Bienvenida + 1 pregunta diseñada ("¿Qué edad tiene?", marcada "2 de 6"). Las otras 4 no existen. Después viene el escáner por foto. |
| Dónde aparece el paywall | No está definido en el recorrido. Existe la pantalla "Aquí eliges tu plan", suelta. |
| Modelo | Prueba gratis de 7 días, plan anual y mensual. |
| Micro-compromisos | Solo la edad y la foto. |
| Animaciones | Ninguna en el onboarding (sí en el premio). |
| Qué muestra el paywall | Título "Un plan para cada uno de tus perros", 4 funciones, anual US$49,99 (≈US$4,17/mes en chico), mensual US$6,99, botón "Empezar mis 7 días gratis" y "Cancela cuando quieras". |
| Conversión que transmite | Media-baja: se ve como una lista de precios genérica, no como "el plan de MI perro". |

## R2 — Diagnóstico (contra 02B y 02C)

**Onboarding**
| Punto | ¿Pasa? | Impacto |
|---|---|---|
| Una decisión por pantalla | ✅ | — |
| Barra de progreso siempre visible | ⚠️ Solo en 1 pantalla | Medio |
| Cada pregunta personaliza o compromete | ⚠️ Solo la edad | Alto |
| Hace los 5 trabajos (segmentar, personalizar, activar, crear deseo, preparar el pago) | ❌ Faltan personalizar, crear deseo y preparar el pago | Alto |
| Animación "armando tu plan" antes del paywall | ❌ | Alto |
| El resultado usa el nombre y las respuestas | ❌ No se pide el nombre del perro | Alto |
| Se pueden saltar pasos no críticos | ⚠️ Solo "Lo adopté y no sé" | Bajo |
| Primera victoria antes de 60 s | ✅ La foto da un resultado al instante | — |
| Longitud según el nicho (4 a 8 pasos) | ❌ Incompleto | Medio |
| Regla "para todos los perros" | ❌ Dice "Escáner de raza" y muestra raza pura al 88% | Alto |

**Paywall**
| Punto | ¿Pasa? | Impacto |
|---|---|---|
| Título con el objetivo del usuario | ❌ Habla del producto | Alto |
| Logo y forma de volver | ⚠️ Hay botón de cerrar, sin logo | Bajo |
| Título de 10 palabras o menos | ✅ | — |
| Palabras clave resaltadas | ❌ | Medio |
| Responde las 7 preguntas | ⚠️ Responde 3 (cancelar, plan recomendado, salida) | Alto |
| Muestra el resultado personalizado | ❌ | Alto |
| Visual que vende | ❌ Solo una lista | Medio |
| Prueba social real | ✅ No inventa (no hay); falta usar la garantía como respaldo | Medio |
| Máximo 3 funciones | ❌ Tiene 4 | Bajo |
| Anual mostrado como precio por mes | ❌ Lo grande es US$49,99 | Alto |
| Costo de la IA | ⚠️ Consejero ilimitado: fijar un uso justo más adelante | Bajo |
| Botón con beneficio | ✅ "Empezar mis 7 días gratis" (mejorable con el nombre) | — |
| Garantía concreta | ❌ No aparece la garantía Hotmart | Alto |
| Fecha exacta del cobro | ❌ | Alto |
| Inversión visible ("hecho con tus N respuestas") | ❌ | Medio |
| Mecanismo con nombre | ❌ | Medio |

## R3 — Plan de rediseño

**Decisión:** Modelo 2 (primero el onboarding, después el paywall). La app es de **plan diario** (cuidado y bienestar) → onboarding de **8 pasos** + paywall en **3 pantallas** (la secuencia que más convierte, +37% según Superwall 2026). Prueba de 7 días (confirmada).

**Mecanismo con nombre:** **"Plan de Bienvenida Kopeet"**. Sirve para cachorros y adultos, adoptados o comprados.

**Nuevo onboarding**
| # | Pantalla | Para qué |
|---|---|---|
| 0 | Bienvenida "Tu perro, entendido por IA" (ya existe) | Entrada |
| 1 | "¿Cómo se llama tu perro?" (se puede saltar) | Personalizar todo lo que sigue |
| 2 | "¿Cómo llegó [Bruno] a tu vida?" Refugio · Rescatado de la calle · Criador o tienda · Regalo | Segmentar sin asumir raza |
| 3 | "¿Qué edad tiene?" (ya existe, con "Lo adopté y no sé") | Vacunas, ración y ejercicio |
| 4 | "¿Qué te preocupa hoy?" (puede elegir varias): vomita o tiene diarrea · no come · lloró la primera noche · no orina en su baño · se come sus heces · su primera vacuna · no sé su edad | Eco de las frases de la ficha |
| 5 | Reconocimiento: "No lo estás haciendo mal: nadie te explicó qué es normal en las primeras semanas. Por eso Google te confunde." | Quitar la culpa |
| 6 | Foto → **mezcla probable**, edad y tamaño adulto estimados | Primera victoria |
| 7 | "¿A qué hora lo sacas a pasear?" + permiso para avisos | Fija la hora de los avisos |
| 8 | Animación: "Armando el Plan de Bienvenida de Bruno… con tus 6 respuestas" | Crear deseo |

**Nuevo paywall (3 pantallas)**
1. **"El Plan de Bienvenida de Bruno está listo"**: hoy 35 min de ejercicio, ración de 320 g, próxima vacuna el 15 de noviembre, semana 1 de adaptación. El resto se ve bloqueado.
2. **"Así funcionan tus 7 días gratis"**: Hoy (acceso completo) → Día 5 (te avisamos) → Día 7 (se cobra; cancela antes y no pagas). Garantía Hotmart de 7 días.
3. **Precio**: título "Empieza el plan de Bruno hoy". 3 beneficios. Anual **US$4,17/mes** grande y preseleccionado ("se cobra US$49,99 al año · ahorras 40%"). Mensual US$6,99. Botón **"Empezar el plan de Bruno gratis"**. Debajo: "Hoy no pagas nada. El 16 de noviembre se cobra el plan que elegiste." Garantía. Enlace "Ahora no".

**Impacto esperado (hipótesis, no medido):** la secuencia de 3 pantallas suma hasta +37% frente a una sola pantalla, y mostrar el paywall después de un momento de valor da 2,1 veces más inicios de prueba (Adapty 2026). Se confirma solo cuando haya usuarios reales.

## R4 — Aprobado por la fundadora el 9 de noviembre de 2026 ("procede")
Aprobado.

## Pendiente para después (fuera del rescate)
- Uso justo del Consejero 24 h (costo de la IA).
- Barra de adaptación "3 días, 3 semanas, 3 meses".
- Semáforo de salud y alerta de emergencia con la veterinaria más cercana.

## R5 — Ejecutado en la vista previa (v9, 9 de noviembre de 2026)
- Capa 1: onboarding de 8 pasos con barra de progreso "N de 8" (nombre · cómo llegó · edad · qué te preocupa · reconocimiento · foto · hora del paseo · armando el plan). El paso 1 se puede saltar.
- Capa 2: pantalla "Armando el Plan de Bienvenida de Bruno" con anillo animado, lista que se completa y "Hecho con tus 6 respuestas". El escáner ahora dice "Escáner de tu perro" y "Mezcla con Border collie".
- Capa 3: paywall en 3 pantallas (plan listo con partes bloqueadas → los 7 días gratis con fechas y garantía Hotmart → precio con anual a US$4,17/mes, total anual visible, botón "Empezar el plan de Bruno gratis", fecha del cobro y "Ahora no").
- Capa 4: entrada escalonada de cada pantalla, toque que achica un poco el elemento (escala 0,97), anillo y lista animados, cursor que parpadea; todo se apaga si el celular pide reducir el movimiento.
- Capa 5: textos en el lenguaje de la ficha y con opciones fijas. Revisado: ninguna de las 19 pantallas se corta.
- Verificación: es una vista previa en HTML, así que no aplican tsc ni build. Se revisó en el navegador con capturas de los pasos 8 y del paywall 3. El revisor visual automático no está en este entorno.

---

## Página de ventas — ángulo aprobado y página construida (9 de noviembre de 2026)
- **Big Idea:** "No es que lo estés haciendo mal: todo lo que encuentras en internet está escrito para otro perro. El Plan de Bienvenida Kopeet arma, con una foto y 6 respuestas, qué hacer cada día con TU perro."
- **Mecanismo con nombre:** Plan de Bienvenida Kopeet (el mismo nombre que en el onboarding y el paywall).
- **Botón (Modelo 2):** "Crear el plan de mi perro gratis" → lleva al onboarding; el pago aparece después, en el paywall.
- **Prueba social:** no hay testimonios → se usa la demostración de la app y la garantía Hotmart de 7 días; sin sección de testimonios.
- **Construida:** `pagina-de-ventas.html` (v2), con las 10 secciones en orden: inicio · problema · lo que cuesta · Plan de Bienvenida · la app por dentro (carrusel) · precio · garantía · preguntas frecuentes · cierre · pie legal. El botón aparece 6 veces. Pesa 95 KB y usa las fotos de `perros/` y `marca/`.
- **Revisión a 375 px (evaluada por Claude, sin revisor externo):** ningún bloque supera 4 líneas ✅ · dolores, pasos y beneficios con íconos ✅ · solo leyendo los títulos se entiende la página ✅ · espacio entre bloques y fondos alternados ✅ · preguntas frecuentes que se abren al tocar ✅ · precio y garantía en cajas ✅ · sin desplazamiento horizontal ✅. Se corrigió: respuestas de las preguntas frecuentes (pasaban de 4 líneas) y tarjetas flotantes que tapaban el celular en pantallas chicas.
- **Pendiente:** páginas reales de Términos, Privacidad, Reembolsos y Contacto (hoy los enlaces del pie no llevan a ninguna parte); capturas reales cuando exista la app; el botón lleva por ahora a la vista previa de la app.

## Páginas legales (9 de noviembre de 2026, versión 1.0)
- Creadas: `terminos.html`, `privacidad.html`, `reembolsos.html`, `contacto.html`, en estilo azul y enlazadas desde el pie de la página de ventas.
- Responsable: Maritza Pilar Vásquez Valencia, persona natural, Santiago de Chile. Ley aplicable: Chile (Ley 19.628 con Ley 21.719 para datos; Ley 19.496 del consumidor).
- Proveedores nombrados: Supabase (São Paulo, Brasil), Anthropic (EE. UU., IA), Hotmart (Brasil, pagos). Si cambia el proveedor de IA o se agrega hosting (Vercel), mapas o correos, hay que actualizar la Política de privacidad.
- **Correo de contacto:** maritzavasquezv@gmail.com (agregado el 9 de noviembre de 2026).
- **Pendiente:** revisión por un abogado en Chile; confirmar en el panel de Hotmart que la garantía esté en 7 días.
- **Para construir en la app** (los textos lo prometen): Perfil → Mi cuenta → Borrar mi cuenta; Perfil → Mi suscripción con enlace a Hotmart; aviso antes del fin de la prueba; casilla de consentimiento sin marcar en el registro; aviso "esto es orientación, no consejo veterinario" junto a cada respuesta del Consejero.

---

## Construcción de la app real

### Etapa 1 — Base + página de ventas (9 de noviembre de 2026) ✅
- Proyecto en `web/`: Next.js 16.4 (App Router, TypeScript, Tailwind 4.3), con motion, lucide-react, zod, @supabase/supabase-js y @supabase/ssr 0.12 instalados.
- Rutas: `/` (página de ventas aprobada, sin cambios de diseño), `/terminos`, `/privacidad`, `/reembolsos`, `/contacto`. Fuente Poppins con next/font. Fotos e isotipo en `web/public/`.
- Verificado: `tsc` ✓ · `next build` ✓ (6 rutas estáticas) · en el navegador a 375 px ✓ (sin desplazamiento lateral, 27 imágenes cargan, carrusel con 5 puntos, enlaces legales funcionan).
- Pendiente: el botón "Crear el plan de mi perro gratis" lleva a `/empezar`, que se construye en la Etapa 2 (onboarding). `npm audit` informa 8 avisos moderados de dependencias de create-next-app (se revisan antes de publicar).
- Para verla: en la carpeta `web`, ejecutar `npm run dev` y abrir http://localhost:3000

### Etapas 2 y 3 — Onboarding y paywall reales (9 de noviembre de 2026) ✅
- `/empezar`: los 8 pasos aprobados (nombre · cómo llegó · edad · qué te preocupa · reconocimiento · foto · hora del paseo con permiso de avisos del navegador · armando el plan con anillo y lista). Barra "N de 8", volver atrás, "Saltar" en el paso 1, botones deshabilitados hasta responder, entrada animada y respeto de "reducir movimiento".
- Las respuestas se guardan en el navegador (sessionStorage) hasta crear la cuenta. La foto se reduce a 640 px.
- `/plan`: paywall en 3 pantallas con los datos de la persona (nombre, origen, edad, primera preocupación, N respuestas), fechas reales de la prueba (hoy, aviso al día 5, cobro al día 7), anual preseleccionado a US$4,17/mes con total anual visible, garantía Hotmart, "Ahora no".
- `/crear-cuenta`: pantalla provisional (marcada "En construcción") que se reemplaza en la Etapa 4. Lee el plan elegido con useSearchParams dentro de Suspense (la primera versión rompía `next build` y se corrigió en un commit aparte).
- Honestidad: la foto todavía NO se analiza con IA; la pantalla lo dice ("versión de prueba"). La ración, las vacunas y la adaptación aparecen bloqueadas sin valores inventados.
- Corrección: los estilos de la página de ventas quedaron limitados a `.lp` para que no choquen con la app (había un choque con la clase "paso").
- Verificado: `tsc` ✓ · `eslint` ✓ · `next build` ✓ · recorrido completo probado en el navegador a 375 px (página de ventas → 8 pasos → 3 pantallas del paywall) ✓.

### Etapa 4 — Cuentas con Supabase (9 de noviembre de 2026) ✅ (falta la prueba con un correo real)
- Base de datos (migración `etapa4_cuentas_perros_consentimientos` en el proyecto kopeet): tablas `perfiles`, `perros` y `consentimientos`, todas con RLS (cada persona solo ve y cambia lo suyo; los consentimientos solo se agregan). Bucket privado `fotos-perros` (máx. 5 MB, JPG/PNG/WebP) con carpetas por usuario. Función `borrar_mi_cuenta()` que solo borra la cuenta propia (el aviso del asesor de Supabase sobre SECURITY DEFINER es intencional).
- App: `/crear-cuenta` (correo + contraseña de 8+ caracteres, casilla obligatoria de Términos/Privacidad con transferencia internacional SIN marcar, casilla opcional de novedades), `/entrar`, `/auth/confirmar` (enlace del correo), `/inicio` (plan del perro guardado, con foto privada) y `/inicio/cuenta` (cerrar sesión y "Borrar mi cuenta" con confirmación escribiendo BORRAR). `proxy.ts` protege /inicio.
- Al primer ingreso se guardan en la cuenta: consentimientos (versión 1.0 de los documentos, idioma y origen), perfil (hora de paseo, avisos, plan elegido), primer perro y su foto.
- Claves: solo la URL y la clave PÚBLICA de Supabase en `web/.env.local` (no se sube a GitHub; plantilla en `web/.env.example`).
- Verificado: `tsc` ✓ · `eslint` ✓ · `next build` ✓ (13 rutas + proxy) · RLS probada con SQL (usuario A ve solo su perro; sin sesión ve 0) ✓ · en el navegador: /inicio sin sesión lleva a /entrar ✓, validaciones del registro ✓, vista a 375 px ✓.
- **Pendiente:** prueba de registro real con el correo de la fundadora (confirmación por correo + guardado del perro + borrar cuenta); "¿Olvidaste tu contraseña?"; el correo de Supabase gratis tiene un límite bajo de envíos por hora → configurar Resend con dominio propio antes de lanzar; al publicar, agregar la dirección final en Supabase → Authentication → URL Configuration.

### Etapa 5 — La app por dentro (9 de noviembre de 2026) ✅ (falta verla con una cuenta real)
- Base de datos (migración `etapa5_registros_y_salud`): `registros` (ejercicio en minutos y baño por día) y `eventos_salud` (vacunas, desparasitación, controles), con RLS: solo sobre lo propio y solo en perros propios.
- Navegación inferior flotante: Hoy · Baño · Consejero · Premios · Cuenta.
- **Hoy** (`/inicio`): selector de perros + "Sumar", racha de ejercicio, barra de adaptación "3 días · 1 semana · 1 mes" (cuenta desde el día en que se sumó el perro), medidor de ejercicio con meta según la edad (+10/+20 min y deshacer), calendario del veterinario (la persona agrega fechas; Kopeet no inventa fechas médicas) y lugares para pasear (abren búsquedas en Google Maps, sin API).
- **Baño** (`/inicio/bano`): racha, semana de lunes a domingo, 5 pasos, botón "Lo hizo en su baño" (1 por día) y festejo con la escarapela a los 7 días.
- **Consejero** (`/inicio/consejero`): semáforo por reglas mientras no hay IA. Rojo para emergencias (se tragó algo, intoxicación, convulsiones, sangrado, no respira, golpe, panza hinchada) → pantalla de **Emergencia** con búsqueda de veterinarias 24 h; amarillo para vómito, diarrea, no come, cojea o tos, con pasos seguros; el resto dice honestamente que la IA llega en la próxima etapa. Aviso "no reemplaza al veterinario" en cada respuesta.
- **Premios** (`/inicio/premios`): 6 premios calculados con los registros reales (primer paseo, pelota de oro, hueso dorado, galleta campeona, escudo sano, corona de peludo).
- **Sumar perro** (`/inicio/sumar-perro`): nombre, origen, edad y foto opcional.
- Verificado: `tsc` ✓ · `eslint` ✓ · `next build` ✓ (18 rutas) · pruebas de lógica (semáforo, rachas, premios, fechas: 12/12) ✓ · RLS con SQL (A no puede registrar ni agendar en el perro de B) ✓.
- **Sin verificar:** las pantallas de /inicio en el navegador, porque piden una cuenta real (queda junto a la prueba de registro de la fundadora).

### Etapa 6 — Servicios reales: código listo (9 de noviembre de 2026) 🟡 falta configurar cuentas
- **IA (Anthropic, SDK oficial `@anthropic-ai/sdk`):** `/api/consejero` y `/api/escaner`. Modelo configurable con `AI_MODEL` (por defecto `claude-opus-5-5`), respuestas en JSON validado (zod), `max_tokens` 4000, esfuerzo bajo para el chat y medio para la foto, caché del texto de sistema y *fallback* automático de Anthropic si la IA declina por seguridad.
- **Seguridad del Consejero:** las emergencias se detectan primero con reglas y se responden al instante sin esperar a la IA; sin clave de IA, la app sigue funcionando con las reglas.
- **Costos:** límite de `AI_LIMITE_DIARIO` usos por persona al día (por defecto 30), registrado en la tabla `usos_ia` (con RLS). Solo se envía a la IA el perro (nombre, origen, edad, preocupaciones), nunca el correo ni datos de la persona.
- **Escáner:** en /inicio aparece "Analizar su foto"; el resultado (mezcla, edad, tamaño y peso adulto, confianza) se guarda en `perros.estimacion`.
- **Hotmart:** `/api/webhooks/hotmart` verifica el `hottok` (comparación segura) y guarda el estado en `suscripciones` (activa, cancelada, reembolsada o vencida), por correo del comprador. La tabla solo la escribe el servidor; cada persona solo puede leer la suya.
- Migración `etapa6_usos_ia_y_suscripciones`. Asesor de seguridad: solo el aviso intencional de `borrar_mi_cuenta`.
- Verificado: `tsc` ✓ · `eslint` ✓ · `next build` ✓ (21 rutas) · las 3 APIs rechazan llamadas sin sesión o sin hottok (401) ✓.
- **Sin verificar:** respuestas reales de la IA (no hay `ANTHROPIC_API_KEY` todavía) y un aviso real de Hotmart.
- **Pendiente de la fundadora:** cuenta en Vercel (importar el repo, carpeta `web`), variables `ANTHROPIC_API_KEY`, `SUPABASE_SECRET_KEY`, `HOTMART_HOTTOK`; producto en Hotmart con la URL del webhook; dominio.
- **Pendiente técnico después del despliegue:** que la app lea `suscripciones` para abrir o cerrar las funciones de pago; agregar la dirección de Vercel en Supabase → Authentication → URL Configuration; correos con Resend.

### Publicación en Vercel (10 de noviembre de 2026) ✅
- Dirección: **https://app-mascota-navy.vercel.app** (proyecto `app-mascota` en la cuenta Vercel de la fundadora, carpeta raíz `web`, se publica solo con cada push a `main`).
- Variables cargadas: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (tipo Config, públicas). El primer despliegue daba error 500 en cuentas y API porque faltaban; se agregaron y se volvió a publicar.
- Verificado en internet: página de ventas, onboarding, paywall, legales, imágenes ✓ · /crear-cuenta y /entrar 200 ✓ · /inicio sin sesión redirige a /entrar ✓ · /api/consejero sin sesión 401 ✓.
- Supabase → Authentication → URL Configuration ✅ (10 nov 2026): Site URL = https://app-mascota-navy.vercel.app · Redirect URL = https://app-mascota-navy.vercel.app/auth/confirmar (verificado después de recargar).
- **Pendiente:** ANTHROPIC_API_KEY, SUPABASE_SECRET_KEY y HOTMART_HOTTOK como variables secretas.

### Arreglo de cuentas (10 de noviembre de 2026)
- Problema real: la fundadora creó su cuenta, el correo quedó confirmado, pero nunca pudo entrar. El enlace del correo usaba el flujo PKCE, que solo funciona en el mismo navegador donde se pidió, y ella lo abrió en Gmail en otro navegador.
- Arreglo: los correos de registro y de "olvidé mi contraseña" ahora usan el flujo implícito (`crearClienteCorreos`) y llegan a `/auth/listo`, que guarda la sesión. Funciona en cualquier navegador o celular. Redirect URL agregada en Supabase: https://app-mascota-navy.vercel.app/auth/listo.
- Nuevo: `/recuperar` (¿Olvidaste tu contraseña?), `/nueva-clave`, aviso en `/entrar` cuando el correo ya está confirmado y casilla "Mostrar contraseña".
- Correos en español: Supabase NO permite editar las plantillas sin un SMTP propio → se hace con Resend cuando haya dominio.
- Límite: el correo gratis de Supabase envía muy pocos correos por hora a todo el proyecto; si un correo no llega, hay que esperar.
- ✅ Prueba real de la fundadora (10 nov 2026): entró a su cuenta con "olvidé mi contraseña". Se guardaron perfil (anual, paseo de noche), perro Galia (criador, cachorro) y los 3 consentimientos. La foto NO se guardó: quedaba pendiente en el navegador del recorrido y entró desde otro. Arreglo: botón "Subir su foto" / "Cambiar su foto" en Hoy (`components/app/SubirFoto.tsx`), que reemplaza la foto anterior y borra la estimación vieja.
- 🤖 IA activada (10 nov 2026): la fundadora creó su cuenta en Claude Console (saldo US$5) y cargó `ANTHROPIC_API_KEY` como Secret en Vercel. Se volvió a publicar para que la app la use.

### Cambios por la prueba de la fundadora (10 de noviembre de 2026)
- **Escáner:** decía "mestiza" para Galia (Border collie con pedigrí). Causas: la instrucción a la IA estaba sesgada hacia "mestizo", no recibía lo que sabe la dueña, y la foto era una ilustración. Arreglo: instrucción sin sesgo (nombra la raza si los rasgos coinciden, mezcla solo si se ve), la IA recibe raza declarada, pedigrí, origen y edad, y la tarjeta permite "¿Sabes su raza? Indícala aquí" (+ "Tiene pedigrí"). La raza de la dueña manda y se muestra en verde; la IA queda como "Según la foto". Botón "Volver a analizar". Migración `raza_declarada_por_la_duena` (columnas `raza_declarada`, `con_pedigri`).
- **Emergencia siempre visible:** botón rojo "Emergencia" fijo arriba en toda la app. La pantalla sin motivo muestra las 8 señales de emergencia y "Buscar veterinaria 24 h cerca".
- **"Baño" → "Pipí y caca en su lugar":** la gota de agua hacía pensar en bañar al perro. Ahora usa una huella de perro, está como tarjeta en Hoy (registrar + racha + enlace al plan) y salió de la barra de abajo, que quedó en Hoy · Consejero · Premios · Cuenta. Criterio de la fundadora: lo del día a día (comer, dormir, hacer sus necesidades, veterinario) va en Hoy.
- Consejero: a la fundadora le gustó ✅.
- **Hoy con todas las necesidades del perro** (pedido de la fundadora): tarjeta "Su rutina de hoy" con Comer (comidas según la edad: 3 cachorro, 2 adulto/senior), Paseo (+15 min), Juego (+10 min), Pipí y caca en su lugar y Dormir (horas orientativas según la edad, "Durmió bien"), con deshacer en cada fila y contador "N de 5". Arriba queda el medidor de actividad (paseo + juego) y abajo el Veterinario. Migración `rutina_diaria_tipos` (registros: comida, paseo, juego, descanso).
- **Barra de abajo según la fundadora:** Hoy · Consejero (con Emergencia dentro: tarjeta roja "¿Es una emergencia?" arriba del chat y punto rojo en el ícono) · Premios · Destinos · Cuenta. Se quitó el botón flotante de emergencia.
- **Destinos** (`/inicio/destinos`): lugares para ir con el perro en 3 grupos (pasear y jugar · salir con tu perro · su cuidado): parques, playas, senderos, cafés, hoteles, veterinarias 24 h, peluquerías, tiendas y guarderías, como búsquedas en Google Maps cerca de la persona. Los "Lugares para pasear" salieron de Hoy (queda un enlace a Destinos).

### Pagos y panel de administración — código (10 de noviembre de 2026)
- `lib/plan.ts` + `/api/plan`: el plan está activo si Hotmart avisó una compra vigente para el correo de la cuenta, o si el correo está en `ADMIN_EMAILS`.
- La IA (Consejero y escáner) ahora requiere plan activo. Sin plan: el Consejero responde con las reglas de seguridad (las emergencias siguen funcionando siempre) y muestra "Activar mi plan"; el escáner responde 402 con explicación.
- Tarjeta "Activa tu plan" en Hoy con los enlaces de pago de Hotmart (`NEXT_PUBLIC_HOTMART_PAGO_ANUAL` y `_MENSUAL`); pide pagar con el mismo correo de la cuenta.
- Panel `/admin` (solo `ADMIN_EMAILS`, protegido también por `proxy.ts`): cuentas, planes activos, perros, usos de IA de hoy y lista de usuarios con su estado. Necesita `SUPABASE_SECRET_KEY` en Vercel. Enlace en Cuenta.
- `ADMIN_EMAILS` cargada en Vercel (tipo Config) con el correo de la fundadora antes de publicar ✅.
- `SUPABASE_SECRET_KEY` cargada en Vercel por la fundadora (Secret) ✅. Activa el panel /admin y el webhook de Hotmart.
- **Panel de administración sin clave secreta** (10 nov 2026): la clave secreta de Supabase falló 3 veces al copiarla (primero con "•••", después se pegó la clave pública). Se cambió el panel para que no la necesite: función `resumen_admin()` en la base (SECURITY DEFINER) que solo responde a los correos de la tabla privada `administradores` (migración `panel_admin_sin_clave_secreta`). `SUPABASE_SECRET_KEY` queda solo para el webhook de Hotmart y se resuelve en esa etapa.
- **Editar o borrar un perro** (10 nov 2026): `/inicio/editar-perro?id=…` con nombre, raza, pedigrí, origen, edad y foto; "Borrar a [nombre]" con confirmación (borra también su foto; registros y eventos se borran en cascada). Enlace "Editar o borrar a [nombre]" bajo los perros en Hoy.
- Texto cambiado a pedido de la fundadora: "Pipí y caca" → "Orina y heces" en Hoy, el plan, Premios y la página de ventas.

### Tres idiomas: español, inglés y portugués (10 de noviembre de 2026) ✅
- Pedido de la fundadora: "colocarle idiomas español y inglés" → "Todo", "Automático + botón", "con un botón", "y también portugués".
- **Botón ES · EN · PT con banderas** (Chile, EE. UU., Brasil; en celular se ven solo las banderas en la cabecera) en: página de ventas (arriba), inicio del plan (paso 1), pantalla de planes, crear cuenta, entrar, recuperar contraseña, legales y **Cuenta → Idioma** dentro de la app.
- **Automático**: la primera vez se usa el idioma del celular (es → español, pt → portugués, cualquier otro → inglés). La elección queda guardada en la cookie `idioma`.
- **Página de ventas y legales con dirección propia**: `/` (español), `/en`, `/pt`, y `/en/terminos`, `/pt/privacidad`, etc. Quien entra a `/` con el celular en inglés o portugués va solo a su versión.
- **Toda la app traducida**: Hoy (rutina, adaptación, veterinario), Orina y heces, Consejero, Emergencia, Premios, Destinos (las búsquedas de Google Maps también van en el idioma), Cuenta, sumar/editar perro, escáner y avisos de error.
- **IA en el idioma elegido**: el Consejero y el escáner responden en español, inglés o portugués de Brasil. El semáforo de emergencias reconoce palabras clave en los tres idiomas.
- Legales en inglés y portugués llevan nota: "traducción de cortesía; prevalece la versión en español" → **revisar con el abogado** junto con la versión en español.
- No traducido a propósito: el panel `/admin` (solo lo usa la fundadora). Los correos de Supabase siguen en su texto por defecto hasta conectar Resend (entonces se harán en 3 idiomas).
- Código: `lib/idiomas.ts` (común), `lib/i18n.ts` (`useT()` con `t("es","en","pt")`), `components/SelectorIdioma.tsx`, `components/landing/Ventas.tsx`, `components/legal/*`, `proxy.ts` (redirección por idioma).

### Panel de administración profesional (11 de noviembre de 2026) 🟡 publicado, falta revisión visual con sesión
- Aprobado por la fundadora ("Yes, build it") sobre el plan de 11 secciones. Las guías citadas en su prompt (21-BACKOFFICE, CLAUDE.md Regla 7, revisor-visual) no existen en este proyecto: se siguió su intención.
- **Secciones** (`/admin`): Avisos arriba · Resumen ("Facturaste X y te quedaron Y limpios") · Ventas (ingresos, compras, MRR, reembolsos, cancelaciones voluntarias vs involuntarias, 12 meses) · Ganancia real (ingresos − Hotmart − afiliados − impuestos − IA − servidores − correos − publicidad) · Usuarios (activación, retención 1/7/30 días, activos) · Uso (embudo visita → 8 pasos → planes → cuenta; acciones más usadas) · Canales (LTV, CAC, LTV:CAC, meses para recuperar, ganancia por canal) · IA (costo real hoy/mes, por función, por usuario, por día) · Personas (buscar, **agregar a mano** con nombre y correo, enviar enlace de acceso, quitar acceso) · Salud (avisos de Hotmart, errores) · Ajustes (impuestos, servidores, correos, gasto en publicidad, enlaces ?origen=, **hottok de Hotmart**).
- Lo que no existe se muestra como "Sin datos" (nunca inventado).
- **Datos nuevos** (Supabase): tablas `ventas`, `avisos_hotmart`, `eventos` (registro de uso), `errores`, `gastos_publicidad`, `ajustes_negocio`, `accesos_manuales`; columnas de costo en `usos_ia`, `nombre`/`origen` en `perfiles`, `vence_en`/`origen` en `suscripciones`; esquema `privado.secretos`.
- **Seguridad**: `/admin` se verifica en el servidor (función `es_admin`); todas las tablas nuevas con RLS cerrado; solo funciones que exigen administradora pueden leer/escribir. Probado: un usuario normal recibe "permission denied" y las funciones admin lo bloquean.
- **Hotmart sin clave secreta**: el webhook llama a `hotmart_recibir()`, que valida el hottok guardado desde el panel. Ya no se usa `SUPABASE_SECRET_KEY` ni `HOTMART_HOTTOK` (se pueden borrar de Vercel). Probado con una venta simulada: guarda bruto, comisión de Hotmart, neto, MRR anual/12, ignora avisos repetidos.
- **Costo de IA real**: cada llamada guarda modelo, tokens y costo (precios Opus 5.5 US$4/20 por millón; respaldos con su precio). Los 3 usos anteriores quedan "sin costo".
- **Canal de origen**: enlaces con `?origen=instagram` (o utm_source / referrer) se guardan en el registro.
- Pendiente: revisión visual de cada pantalla con la sesión de la fundadora; conectar Hotmart (pegar hottok en Ajustes + webhook en Hotmart).

### Plan Familiar y límite de perros (11 de noviembre de 2026) ✅ código publicado
- Decisión de la fundadora: "plan por un perro y plan familiar".
- **Individual (1 perro)**: US$6,99/mes o US$49,99/año (sin cambio). **Familiar (hasta 4 perros)**: US$9,99/mes o US$69,99/año (US$5,83/mes). Precios en `web/lib/planes.ts` (fuente única).
- Pantalla de planes: selector "1 perro / Hasta 4 perros" + anual/mensual. Página de ventas (3 idiomas): tercera tarjeta "Familiar" y FAQ actualizada. Términos (3 idiomas) con los 4 precios.
- **Límite en la base** (no se puede saltar): trigger `limite_perros` en `perros`. Sin plan o plan individual: 1 perro; familiar o cortesía: 4; administradoras: sin límite. Los perros que ya existían no se borran.
- "Sumar perro" y "Cuenta" muestran "X de Y perros" y una tarjeta para pasar al Plan Familiar.
- Hotmart: el nombre del plan debe incluir "Familiar" (p. ej. "Kopeet Familiar Anual"). Enlaces de pago nuevos en Vercel cuando existan: `NEXT_PUBLIC_HOTMART_PAGO_FAMILIAR_ANUAL` y `NEXT_PUBLIC_HOTMART_PAGO_FAMILIAR_MENSUAL`.
- Probado en la base: plan familiar desde Hotmart, bloqueo del 2º perro sin plan, hasta 4 con familiar.

### Resumen semanal por correo (11 de noviembre de 2026) 🟡 listo, falta la API key de Resend
- Cada **lunes 12:00 UTC** (9:00 en Chile en verano, 8:00 en invierno) llega a las administradoras un correo: vendiste X, te quedaron Y limpios (ingresos − Hotmart − afiliados − impuestos − IA − servidores/correos y publicidad prorrateados a 7 días), usuarios nuevos, activos de la semana, usos y costo de IA, cancelaciones, reembolsos y avisos (IA > 20% de ventas, Hotmart con errores, costos > ventas, 5+ errores, pagos fallidos) o "✅ Todo en orden". "Sin datos" donde no hay dato.
- Todo dentro de Supabase: extensiones **pg_cron** (tarea `kopeet-resumen-semanal`) y **pg_net** (envío a la API de Resend). Funciones `privado.resumen_semanal_datos()` y `privado.enviar_resumen_semanal()`; desde el panel: `admin_guardar_resend`, `admin_enviar_resumen_prueba`, `admin_estado_resumen` (todas exigen administradora). SQL en `web/supabase/resumen_semanal.sql`.
- La API key de Resend se pega una vez en **/admin → Ajustes → Resumen semanal por correo** (queda en `privado.secretos`, no en Vercel). Remitente `onboarding@resend.dev`: sin dominio propio, Resend solo envía al correo dueño de la cuenta, por eso la cuenta Resend debe crearse con maritzavasquezv@gmail.com.
- Probado en transacción con rollback: correo en español, asunto y cifras correctos, destinatario la administradora, tarea programada activa.
- Pendiente: que la fundadora cree la cuenta Resend, pegue la key y reciba el correo de prueba.

### Auditoría legal (11 de noviembre de 2026) ✅ publicada
- Prompt de auditoría de la fundadora. El documento "docs/sistema/47-LEGAL-FISCAL-Y-PRIVACIDAD.md" y FICHA-MERCADO.md **no existen** en el proyecto: se auditó con el checklist del prompt y el código real. Datos del responsable ya conocidos: Maritza Pilar Vásquez Valencia, persona natural, Santiago de Chile, maritzavasquezv@gmail.com.
- **6 páginas legales** en 3 idiomas, enlazadas en el pie de la página de ventas y de las legales: Términos, Privacidad, Reembolsos, **Cookies (nueva)**, **Aviso sobre la IA (nueva)**, Contacto.
- **Discrepancias críticas corregidas** (lo prometido ≠ lo que hacía el código):
  1. Se prometía "te avisamos antes de que termine la prueba / antes del cobro" y la app no envía ese aviso → ahora se muestra la fecha exacta del primer cobro y se explica cómo cancelar. ⚠️ Volver a prometerlo solo cuando exista el correo de aviso (y antes de vender el plan anual en EE. UU.: aviso previo a la renovación anual, ley de California).
  2. Privacidad decía que recopilamos ubicación, peso y mensajes del Consejero → no es así (Destinos solo abre Google Maps; el texto de las preguntas no se guarda). Corregido.
  3. La medición de uso (registro de eventos y canal de origen) funcionaba sin permiso → ahora hay **aviso de cookies con "Aceptar" y "Rechazar" igual de fáciles**; nada de medición se guarda ni envía antes de aceptar; al rechazar se borra lo guardado. Se cambia la elección en /cookies. Probado en el navegador.
  4. Términos exigían 18+ pero el registro no lo pedía → la casilla de aceptación ahora incluye "declaro tener 18 años o más".
  5. Reembolsos decía que había un enlace directo para cancelar en la app y no existía → nuevo botón en Cuenta "Cancelar o gestionar mi suscripción en Hotmart".
- **Agregado**: proveedores Vercel y Resend; Anthropic no entrena con datos de la API; borrado de cuenta al instante y qué queda (compras por ley tributaria, uso y errores anónimos); derechos LGPD/UE/California; licencia de uso; propiedad de las respuestas de la IA; "no es servicio de emergencias"; aviso "la IA puede equivocarse" visible junto al Consejero y al escáner.
- Garantía coherente en todo: 7 días gratis + 7 días de garantía Hotmart (landing = planes = términos = reembolsos).
- ⚠️ Pendiente humano: revisión por abogado en Chile antes de lanzar (versión 1.1 y traducciones EN/PT); confirmar con contador el % de impuesto (boleta de honorarios / IVA por servicios digitales).

### Advertencia antes de borrar la cuenta (11 de noviembre de 2026) ✅
- En Cuenta → Borrar mi cuenta: aviso visible "Antes de borrar tu cuenta, cancela tu suscripción en Hotmart; borrar la cuenta no detiene los cobros", con enlace a Hotmart (3 idiomas).
- Si la persona tiene una suscripción pagada activa, además debe marcar "Ya cancelé mi suscripción en Hotmart" para poder borrar.

### Revisión legal con foco en Chile (11 de noviembre de 2026) ✅ publicada (legales versión 1.2)
- Pedido: "revisa todo lo legal, estoy en Chile, no debe vulnerar ninguna ley".
- **Garantía de 7 → 10 días** en toda la app y páginas (3 idiomas): cumple el **derecho a retracto** de compras por internet de la Ley N° 19.496 (10 días). ⚠️ En Hotmart configurar la garantía del producto en **10 días** (Hotmart permite 7 a 30).
- **Términos** (evitar cláusulas abusivas, art. 16 Ley 19.496): cambio de precio o de términos solo con aviso previo (30 días) y aceptación, o cancelación sin costo con devolución de lo no usado; suspensión de cuentas con aviso y motivo; reclamos ante **Sernac o Juzgado de Policía Local** del domicilio del consumidor (art. 50 A), en vez de "tribunales de Santiago"; precio total con impuestos visible antes de pagar; la responsabilidad que la ley no permite excluir no se excluye.
- **Privacidad**: reclamos ante la Agencia de Protección de Datos Personales (Ley 21.719).
- **Publicidad** (art. 28, publicidad engañosa): se quitó la cifra sin respaldo "~50 h al año"; ahorro del plan familiar corregido a 41% (real: 41,6%).
- ⚠️ Pendiente humano (no se puede resolver con código):
  1. Reglamento de Comercio Electrónico (D.S. 6/2021): publicar **RUT y domicilio** del proveedor en Contacto/Términos (o constituir empresa y usar sus datos). Decisión de la fundadora.
  2. **Inicio de actividades en el SII** y forma de documentar cada venta (boleta) antes de vender: con contador.
  3. Revisar con abogado si el precio debe mostrarse también en pesos chilenos (CLP) a clientes en Chile.
  4. Registrar la marca "Kopeet" en INAPI.
  5. Correos de novedades: cada envío debe incluir forma de darse de baja (Ley 19.496 art. 28 B).
  6. Revisión final por abogado en Chile (versión 1.2 y traducciones).

### Auditoría de seguridad (11 de noviembre de 2026) ✅ arreglos publicados
- Resultado: 0 críticos. Bien: sin claves en código ni historial; RLS en todas las tablas (anónimo no lee nada); funciones admin protegidas; panel protegido en servidor; plan y límites de IA en servidor; fotos privadas (5 MB, solo imágenes); borrar cuenta borra de verdad; HTTPS + HSTS; npm audit 0 vulnerabilidades.
- **Arreglado (migración `hotmart_seguridad`, archivo `web/supabase/hotmart_seguridad.sql`)**:
  - Cancelar la suscripción mantiene el acceso hasta el fin del período pagado (usa `date_next_charge` de Hotmart; si no viene, la última compra + 1 mes/1 año).
  - Avisos de Hotmart desordenados: uno más antiguo no cambia el acceso (nueva columna `suscripciones.evento_en`); una compra reembolsada no se reactiva con un aviso repetido.
  - Intentos con hottok falso: se guardan máx. 30 por hora.
  - Probado con compras simuladas dentro de una transacción deshecha (6/6 casos ok).
- **Cabeceras de seguridad** en `web/next.config.ts`: X-Frame-Options DENY, frame-ancestors 'none', nosniff, Referrer-Policy, Permissions-Policy.
- Nota: el MRR del panel cuenta como activa a una suscripción cancelada que aún está en su período pagado (hasta que vence).
- ⚠️ Pendiente de la fundadora: (1) SMTP propio en Supabase (sin él los correos de cuenta no llegan a clientes); (2) activar "Leaked password protection" en Supabase → Authentication.
- Recomendados sin hacer: tope global a `registrar_evento`, chequear perro propio al editar `eventos_salud`, mover `pg_net` fuera de public, comparación de hottok en tiempo constante.

### Recordatorios por notificación push (11 de noviembre de 2026) ✅ publicado y probado en celular real
- Pedido de la fundadora: recordatorios gratis (WhatsApp queda para cuando haya ventas: cuesta por mensaje y requiere cuenta de Meta y número propio). El recorrido inicial ya pedía permiso de avisos pero nunca se enviaban: ahora sí.
- **Avisos**: paseo a la hora elegida (7, 13, 18 o 21 h, si hoy no anotó ejercicio) · vacunas/desparasitación/controles 3 días antes y el mismo día a las 10:00 · racha a las 20:00 si lleva 2+ días y hoy no anotó · aviso de prueba. Hora local de cada persona; 3 idiomas; nunca se repite (tabla `push_enviados`).
- **Piezas**: `app/manifest.ts` (app instalable; en iPhone es obligatorio instalarla para recibir avisos) · `public/sw.js` · `lib/avisos.ts` · `components/app/Recordatorios.tsx` (tarjeta en Hoy si no están activos, cerrable; tarjeta completa en Cuenta con apagar y "Enviar aviso de prueba"; se conecta solo al abrir la app si ya dio permiso) · SQL `web/supabase/avisos_push.sql` · función Edge `enviar-avisos` (`web/supabase/functions/`, sin JWT, protegida con clave interna `push_cron`) · pg_cron `kopeet-avisos-push` cada 15 min.
- Claves VAPID generadas por la propia función y guardadas en `privado.secretos` (nadie las copió).
- Probado: función responde 200 y rechaza sin clave (401); lógica de paseo, salud, racha y prueba con datos simulados en transacción deshecha (sin repetidos). Privacidad actualizada (versión 1.3).
- ✅ Probado en el celular de la fundadora (Motorola Android, Chrome): se activó en Cuenta y llegó el aviso de prueba (enviados 1, fallidos 0). Pendiente: probar en iPhone instalado en la pantalla de inicio.

### Identificación de la vendedora (11 de noviembre de 2026) ✅
- La fundadora vende como **persona natural** con su inscripción de primera categoría en el SII (al día; giro ampliado para servicios digitales). No crea SpA.
- Publicado en Términos (1), Privacidad (1), Contacto y pie de las páginas legales, en 3 idiomas: nombre, **RUT 15.333.434-K** y domicilio **solo "Santiago de Chile"** (sin comuna ni calle, por decisión de privacidad; la dirección completa se usa solo si el abogado/contador confirma que la ley la exige en la web).
- Privacidad versión 1.4 (11 nov 2026): Brevo (Francia, UE) agregado como proveedor de los correos de la cuenta.
