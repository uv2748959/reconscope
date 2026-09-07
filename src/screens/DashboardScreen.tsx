import { useParams } from "react-router-dom";

export default function DashboardScreen() {
  const { id } = useParams();
  return (
    <section>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Placeholder screen for project {id}. This will show counts,
        categories, recent evidence, scope status, and unresolved items.
      </p>
    </section>
  );
}
