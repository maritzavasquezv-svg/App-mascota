import type { PlanId } from "@/lib/planes";

/**
 * Enlaces de pago de Hotmart por plan (producto Kopeet, ID 8954817). Son públicos: los ve cualquier cliente.
 * Una variable de entorno NEXT_PUBLIC_HOTMART_PAGO_* en Vercel tiene prioridad sobre estos valores.
 * null = todavía no tenemos el enlace de ese plan (la app no muestra su botón).
 */
export const PAGOS_HOTMART: Record<PlanId, string | null> = {
  mensual: "https://pay.hotmart.com/X108464213R?off=vjnh580u",
  anual: null,
  familiar_mensual: null,
  familiar_anual: null,
};
