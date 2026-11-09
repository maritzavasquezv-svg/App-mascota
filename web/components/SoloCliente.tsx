"use client";
import dynamic from "next/dynamic";

// El onboarding y el paywall leen las respuestas guardadas en el navegador,
// así que se muestran solo en el cliente (sin versión del servidor).
export const OnboardingCliente = dynamic(() => import("@/components/onboarding/Onboarding"), { ssr: false });
export const PaywallCliente = dynamic(() => import("@/components/paywall/Paywall"), { ssr: false });
