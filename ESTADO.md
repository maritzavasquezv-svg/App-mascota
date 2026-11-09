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
