import { useParams } from "react-router-dom";

export default function EvidenceScreen() {
  const { id } = useParams();
  return (
    <section>
      <h1 className="text-2xl font-semibold">Evidence Log</h1>
      <p className="mt-2 text-slate-600">
        Placeholder screen for project {id}. This will create, edit, delete,
        filter, verify, and cite observations.
      </p>
    </section>
  );
}
