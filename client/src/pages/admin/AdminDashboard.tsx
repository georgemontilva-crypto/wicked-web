import { AdminLayout, Notice } from "@/components/AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  Clapperboard,
  FileText,
  FileWarning,
  Inbox,
  Loader2,
  Package,
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const overview = trpc.adminAuth.dashboardOverview.useQuery(undefined, {
    retry: false,
  });
  const c = overview.data?.counts;

  const tiles = [
    { label: "Lab reports", value: c?.totalReports, icon: FileText, href: "/admin/lab-reports" },
    {
      label: "Products without a published report",
      value: c?.productsMissingReport,
      icon: FileWarning,
      href: "/admin/lab-reports",
    },
    { label: "Products", value: c?.totalProducts, icon: Package, href: "/admin/products" },
    { label: "Videos", value: c?.totalVideos, icon: Clapperboard, href: "/admin/videos" },
    { label: "Messages to answer", value: c?.openMessages, icon: Inbox, href: "/admin/messages" },
  ];

  return (
    <AdminLayout title="Dashboard">
      {overview.data && !overview.data.storage.configured && (
        <Notice>
          <p className="font-semibold">File storage is not configured</p>
          <p className="mt-1">
            Uploading lab reports, product photos and videos will fail until
            these variables are set in Railway:{" "}
            <span className="font-mono text-xs">
              {overview.data.storage.missing.join(", ")}
            </span>
          </p>
        </Notice>
      )}

      {overview.data && c?.totalProducts === 0 && (
        <Notice>
          <p className="font-semibold">The catalogue is empty</p>
          <p className="mt-1">
            The 24 WICK'D flavors load on their own when the products table
            is empty. To load them again, set{" "}
            <span className="font-mono text-xs">SEED_CATALOG=true</span> in
            Railway and redeploy, then delete the variable. Or add products by
            hand under Products.
          </p>
        </Notice>
      )}

      {overview.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tiles.map(t => (
              <Link key={t.label} href={t.href} className="block">
                <div className="h-full rounded-2xl border border-white/10 bg-[#131315] p-5 transition-colors hover:border-white/30">
                  <t.icon className="h-5 w-5 text-white/40" />
                  <div className="mt-3 text-3xl font-bold tabular-nums">
                    {t.value ?? 0}
                  </div>
                  <div className="mt-0.5 text-sm text-white/50">{t.label}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#131315]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-lg font-semibold">Latest messages</h2>
              <Link
                href="/admin/messages"
                className="text-sm font-medium text-white/50 underline-offset-4 hover:text-white hover:underline"
              >
                View all
              </Link>
            </div>
            <ul className="divide-y divide-white/10">
              {overview.data?.recentMessages.length ? (
                overview.data.recentMessages.map(m => (
                  <li key={m.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                    <span className="font-medium">{m.name}</span>
                    {m.topic && <span className="text-white/50">{m.topic}</span>}
                    {!m.handled && (
                      <span className="rounded-full bg-[#9b4be8]/25 px-2.5 py-0.5 text-xs font-semibold text-[#d3b3f7]">
                        New
                      </span>
                    )}
                    <span className="ml-auto shrink-0 text-xs text-white/40">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                    </span>
                  </li>
                ))
              ) : (
                <li className="px-5 py-10 text-center text-sm text-white/40">
                  No messages yet. They arrive from the Contact Us page.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
