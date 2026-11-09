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
