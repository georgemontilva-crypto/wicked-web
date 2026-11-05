import { formatDate } from "@/lib/catalog";
import { Download, ExternalLink, X } from "lucide-react";
import { useEffect } from "react";

export type ReportLike = {
  id: number;
  title: string;
  batch: string | null;
  lab: string | null;
  testedOn: string | null;
  fileUrl: string;
};

/**
 * The certificate inside the page, so the visitor doesn't lose the site to
 * read it. Phones can't render PDFs in an iframe reliably, so there the
 * buttons do the work and the frame is a bonus.
 */
export function PdfModal({
  report,
  productName,
  onClose,
}: {
  report: ReportLike | null;
  productName?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!report) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [report, onClose]);

  if (!report) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Lab report${productName ? ` for ${productName}` : ""}`}
      className="fixed inset-0 z-[90] flex items-stretch justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        className="card-sticker pop-in flex w-full max-w-5xl flex-col overflow-hidden bg-[#0e0619]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-black bg-[var(--accent)] px-4 py-3 text-white sm:px-6">
          <div className="min-w-0">
            <p className="label text-white/80">{report.title}</p>
            <p className="truncate font-display text-xl">
              {productName} {report.batch && <span className="text-white/80">· Batch {report.batch}</span>}
            </p>
            <p className="text-sm text-white/80">
              {[report.lab, report.testedOn && `Tested ${formatDate(report.testedOn)}`].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href={report.fileUrl} target="_blank" rel="noreferrer" className="btn btn-white !px-4 !py-2.5 !text-xs">
              <ExternalLink className="h-4 w-4" /> Open
            </a>
            <a href={report.fileUrl} download className="btn btn-white !px-4 !py-2.5 !text-xs">
              <Download className="h-4 w-4" /> PDF
            </a>
            <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-black text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <iframe title={`${productName ?? ""} lab report`} src={`${report.fileUrl}#view=FitH`} className="min-h-0 w-full flex-1 bg-white" />
      </div>
    </div>
  );
}
