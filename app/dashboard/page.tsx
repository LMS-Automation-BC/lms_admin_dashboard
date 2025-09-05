// app/dashboard/page.tsx or pages/dashboard.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export  default async function DashboardPage() {
  const cookieStore = cookies();
  const isAuth = (await cookieStore).get("auth");

  if (!isAuth) {
    redirect("/login");
  }

  return <h1>Protected Dashboard</h1>;
}
