import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Email sign-up. Stored in the database; the admin exports the list. */
export function Newsletter({ className, big }: { className?: string; big?: boolean }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState(false);
  const subscribe = trpc.site.subscribe.useMutation({
    onSuccess: r => {
      setDone(true);
      toast.success(r.status === "exists" ? "You're already on the list." : "You're in. Welcome to WICK'D.");
    },
    onError: e => toast.error(e.message),
  });

  if (done) {
    return (
      <p className={cn("inline-flex items-center gap-2 font-semibold text-white", className)}>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-[var(--accent)]">
          <Check className="h-4 w-4" />
        </span>
        You're on the list.
      </p>
    );
  }

  return (
    <form
      className={cn("w-full max-w-md", className)}
      onSubmit={e => {
        e.preventDefault();
        if (!agree) {
          toast.error("Tick the box to agree to receive WICK'D emails.");
          return;
        }
        subscribe.mutate({ email, website: website || undefined });
      }}
    >
      {!big && <p className="label text-white/45">Newsletter</p>}
      <div className={cn("flex gap-2", !big && "mt-3")}>
        <label htmlFor={big ? "nl-big" : "nl"} className="sr-only">
          Email address
        </label>
        <input
          id={big ? "nl-big" : "nl"}
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={cn("field", big && "!py-4 !text-lg")}
        />
        <input
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          name="website"
        />
        <button type="submit" disabled={subscribe.isPending} className="btn btn-accent flex-none !px-5" aria-label="Subscribe">
          {big ? "Join" : null}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-sm text-white/60">
        <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
        I'm 21+ and agree to receive WICK'D email updates.
      </label>
    </form>
  );
}
