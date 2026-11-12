import type { PlanId } from "@/lib/planes";

/**
 * Enlaces de pago de Hotmart por plan (producto Kopeet, ID 8954817). Son públicos: los ve cualquier cliente.
 * Una variable de entorno NEXT_PUBLIC_HOTMART_PAGO_* en Vercel tiene prioridad sobre estos valores.
 * null = todavía no tenemos el enlace de ese plan (la app no muestra su botón).
 */
export const PAGOS_HOTMART: Record<PlanId, string | null> = {
  mensual: "https://pay.hotmart.com/X108464213R?off=vjnh580u",
  anual: "https://pay.hotmart.com/X108464213R?off=7msi35ai",
  familiar_mensual: "https://pay.hotmart.com/X108464213R?off=dcw66idx",
  familiar_anual: "https://pay.hotmart.com/X108464213R?off=u6189f3d",
};
