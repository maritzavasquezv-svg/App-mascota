# Lista obligatoria para TODAS las apps (actuales y futuras)

Pedido de Maritza (20 nov 2026): todo lo que corrigió la auditoría de Rentas Inteligentes se aplica en Kopeet,
Kopeet Gatos, Jügue y en cada app nueva. Antes de publicar o vender una app, revisar esta lista punto por punto.

| # | Qué debe tener la app | Kopeet | Gatos | Jügue |
|---|---|---|---|---|
| H2 | Al confirmar el correo se abre una pantalla de pago con el plan ya elegido y un solo botón (no volver a elegir el plan). Aviso: "Hotmart pide tu tarjeta, pero no cobra durante 7 días" + fecha del primer cobro. | ✅ | ✅ | ⏳ al hacer cuentas |
| H1 | Todos los botones de pago abren Hotmart con `email` (correo de la cuenta) y `xcod` (id de la cuenta). La base activa el plan por `xcod` aunque se pague con otro correo y guarda la equivalencia de correos. | ✅ | ✅ | ⏳ |
| Medición | Embudo completo hasta el pago: visita → preguntas → plan elegido → cuenta → correo confirmado → fue a pagar. | ✅ | ✅ | ⏳ |
| H3 | Pixel de Meta solo con consentimiento de cookies (PageView, ViewContent, Lead, InitiateCheckout) + el mismo píxel en Hotmart. Textos legales en todos los idiomas. | ✅ activo | ✅ listo, sin ID | ⏳ |
| H4 | Sección de testimonios bajo los precios; nunca testimonios inventados (oculta si no hay). Maquetas coherentes con los límites reales del plan. | ✅ (sin testimonios aún) | ✅ (sin testimonios aún) | ⏳ |
| H5 | Si falla la tarjeta en una renovación: 5 días de gracia + aviso en la app y por correo (Gmail de soporte) "Tu pago no pasó: actualiza tu tarjeta en Hotmart" (no ofrecer comprar otro plan). Correo 2–3 días antes del primer cobro. | ✅ | ✅ | ⏳ |
| H6 | IA: modelo intermedio para el chat, el caro solo para fotos; límite 10/día y 150/mes, descontado de forma atómica en la base. Variables con nombres nuevos (AI_MODELO_ESCANER, AI_MODELO_CONSEJERO, AI_LIMITE_DIA, AI_LIMITE_MES). | ✅ | ✅ | No usa IA |
| H7 | El aviso de cookies nunca tapa el botón principal en el recorrido de compra (va arriba). | ✅ | ✅ | ✅ no tiene aviso (no usa cookies de medición) |
| H8 | Lo que promete la página de ventas coincide con lo que se recorre (n.º de preguntas, pasos y respuestas) y el plan muestra al menos un dato personal sin candado. | ✅ | ✅ | ⏳ revisar al hacer el onboarding |
| H9 | Ningún botón "no hace nada": Enviar desactivado sin texto y con indicación. | ✅ | ✅ | ⏳ revisar |
| H10 | Textos neutros (no solo para mujeres) en la app y en las instrucciones de la IA. | ✅ | ✅ | ⏳ revisar ("Para hijas y nietas…") |
| H11 | Correo de soporte de la marca (soportekopeet@gmail.com), nunca el personal; sin claves secretas sobrantes en .env.example ni en Vercel. | ✅ | ✅ | ⏳ crear correo de Jügue |
| H12 | El botón de Hotmart solo aparece si el plan viene de Hotmart (no en cortesía). | ✅ | ✅ | ⏳ |
| Seg. | Funciones internas de la base cerradas a la API; revisar el linter de seguridad de Supabase después de cada cambio. | ✅ | ✅ | ⏳ |

Pendientes que dependen de Maritza (todas): 3 testimonios reales, compra de prueba de punta a punta,
correos a clientes ("tu pago no pasó" y aviso antes del primer cobro), "Leaked password protection" en Supabase (plan Pro).
