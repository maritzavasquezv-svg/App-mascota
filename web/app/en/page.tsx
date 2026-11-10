import type { Metadata } from "next";
import Ventas from "@/components/landing/Ventas";

export const metadata: Metadata = { title: "Kopeet AI · Your dog's daily plan", description: "Snap a photo of your dog, answer 6 questions and get their Welcome Plan: vaccines, food and settling in. For mixed breeds, rescues, puppies and adults." };

export default function Pagina() {
  return <Ventas i="en" />;
}
