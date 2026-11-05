import { AdminLayout } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import { Download, Loader2, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

/** Newsletter sign-ups from the site, with a CSV export for the mail tool. */
export default function AdminSubscribers() {
  const utils = trpc.useUtils();
  const list = trpc.site.subscribers.useQuery(undefined, { retry: false });
  const remove = trpc.site.deleteSubscriber.useMutation({
    onSuccess: () => {
      utils.site.subscribers.invalidate();
      toast.success("Removed");
    },
  });

  const exportCsv = () => {
    const rows = list.data ?? [];
    const csv = ["email,signed_up", ...rows.map(r => `${r.email},${new Date(r.createdAt).toISOString()}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `wickd-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Newsletter">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">
          {list.data ? `${list.data.length} subscriber${list.data.length === 1 ? "" : "s"}` : " "}
        </p>
        <button type="button" onClick={exportCsv} disabled={!list.data?.length} className="btn btn-fire !py-2.5 !text-xs">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>
      {list.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : list.data?.length ? (
        <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#120a1f]">
          {list.data.map(s => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <a href={`mailto:${s.email}`} className="inline-flex min-w-0 items-center gap-2 truncate text-sm hover:underline">
                <Mail className="h-4 w-4 flex-none text-white/40" /> {s.email}
              </a>
              <span className="hidden text-xs text-white/40 sm:block">{new Date(s.createdAt).toLocaleDateString()}</span>
              <button
                type="button"
                aria-label={`Remove ${s.email}`}
                onClick={() => {
                  if (window.confirm(`Remove ${s.email}?`)) remove.mutate({ id: s.id });
                }}
                className="rounded-lg p-2 text-white/40 hover:bg-red-500/15 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">No sign-ups yet.</p>
      )}
    </AdminLayout>
  );
}
