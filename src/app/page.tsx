import { redirect } from "next/navigation";

export default function HomePage() {
  // This page should redirect to admin login via next.config.ts
  // This is a fallback component
  redirect('/admin/login');
}
