import { notFound } from "next/navigation";
import { getScan } from "@/app/actions/scan/getScan";
import { ScanReport } from "@/components/scan/ScanReport";
import { canFrameUrl } from "@/lib/frameability";

export const maxDuration = 60;

type ScanPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScanPage({ params }: ScanPageProps) {
  const { id } = await params;
  const result = await getScan(id);

  if (!result.ok) {
    notFound();
  }

  if (result.scan.status === "FAILED") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h1 className="text-2xl font-bold text-foreground">Scan failed</h1>
          <p className="mt-2 text-secondary">
            {result.scan.errorMessage ??
              "We could not analyze this website. Check the URL and try again."}
          </p>
        </div>
      </div>
    );
  }

  if (result.scan.status !== "COMPLETED") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-secondary">
          This scan is still processing. Refresh in a moment.
        </p>
      </div>
    );
  }

  const previewUrl = result.scan.finalUrl ?? result.scan.url;
  const frameable = await canFrameUrl(previewUrl);

  return <ScanReport scan={result.scan} frameable={frameable} />;
}
