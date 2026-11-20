// Correo de soporte que ven los clientes dentro de la app (auditoría H11).
// Cuando exista un correo de la marca, se pone en Vercel como NEXT_PUBLIC_CORREO_SOPORTE y cambia en toda la app.
export const CORREO_SOPORTE = process.env.NEXT_PUBLIC_CORREO_SOPORTE || "soportekopeet@gmail.com";
