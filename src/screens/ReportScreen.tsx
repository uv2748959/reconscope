import { useParams } from "react-router-dom";

export default function ReportScreen() {
  const { id } = useParams();
  return (
    <section>
      <h1 className="text-2xl font-semibold">Report</h1>
      <p className="mt-2 text-slate-600">
        Placeholder screen for project {id}. This will preview, print, and
        export the reconnaissance summary.
      </p>
    </section>
  );
}
