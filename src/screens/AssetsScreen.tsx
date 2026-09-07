import { useParams } from "react-router-dom";

export default function AssetsScreen() {
  const { id } = useParams();
  return (
    <section>
      <h1 className="text-2xl font-semibold">Assets</h1>
      <p className="mt-2 text-slate-600">
        Placeholder screen for project {id}. This will browse domains, DNS
        records, IPs, technologies, people/roles, and relationships.
      </p>
    </section>
  );
}
