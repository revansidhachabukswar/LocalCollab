import { notFound } from "next/navigation";
import Dashboard from "../../dashboard";

export default async function DemoPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (role !== "business" && role !== "creator") notFound();

  return (
    <Dashboard
      role={role}
      displayName={role === "business" ? "Juniper & Moss" : "Sam Rivera"}
      city={role === "business" ? "Mumbai" : "Navi Mumbai"}
      region="Maharashtra"
      email="Sample demo account"
      isDemo
    />
  );
}
