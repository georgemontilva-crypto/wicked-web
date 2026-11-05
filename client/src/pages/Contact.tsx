import { Heading, Logo, Spark } from "@/components/Bits";
import { PublicLayout } from "@/components/PublicLayout";
import { useReveal, useTitle } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { CONTACT_TOPICS, DEFAULT_CONTACT } from "@shared/const";
import { Check, FlaskConical, Instagram, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useSearch } from "wouter";

type Topic = (typeof CONTACT_TOPICS)[number];

export default function Contact() {
  useTitle("Contact Us");
  useReveal([]);
  const details = trpc.site.contactDetails.useQuery().data ?? DEFAULT_CONTACT;
  const search = useSearch();
  const initialTopic = new URLSearchParams(search).get("topic") as Topic | null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<Topic>(initialTopic && CONTACT_TOPICS.includes(initialTopic) ? initialTopic : CONTACT_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [sent, setSent] = useState(false);

  const send = trpc.site.sendMessage.useMutation({
    onSuccess: () => {
      setSent(true);
      setMessage("");
    },
  });

  const errorText = (() => {
    if (!send.error) return null;
    try {
      const issues = JSON.parse(send.error.message) as { message?: string }[];
      if (Array.isArray(issues) && issues[0]?.message) return issues[0].message;
    } catch {
      /* not a validation error */
    }
    return send.error.message || "The message couldn't be sent. Try again in a moment.";
  })();

  return (
    <PublicLayout>
      <section className="container pt-10 sm:pt-16">
        <Heading as="h1" eyebrow="We read every message" title={<>Get in<br />touch</>}>
          <p className="mt-5 max-w-2xl text-lg text-white/75">
            Have a question about WICK'D, a lab report, or carrying WICK'D in your store? Send us a message and our team will get back to you.
          </p>
        </Heading>
      </section>

      <section className="container grid gap-8 py-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="reveal">
          {sent ? (
            <div className="nebula card-sticker px-7 py-12">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-black bg-white text-black shadow-[4px_4px_0_#000]">
                <Check className="h-8 w-8" strokeWidth={3} />
              </span>
              <h2 className="sticker mt-6 text-5xl">Message sent</h2>
              <p className="mt-4 max-w-md text-white/75">
                Thanks, {name.trim().split(" ")[0] || "we got it"}. We'll reply to {email.trim()}.
              </p>
              <button type="button" onClick={() => setSent(false)} className="btn btn-white mt-8">
                Send another
              </button>
            </div>
          ) : (
            <form
              className="panel grid gap-5 p-6 sm:p-9"
              onSubmit={e => {
                e.preventDefault();
                send.mutate({ name, email, phone: phone || undefined, topic, message, website: website || undefined });
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="label text-white/60">
                    Name
                  </label>
                  <input id="c-name" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="field mt-2" />
                </div>
                <div>
                  <label htmlFor="c-email" className="label text-white/60">
                    Email
                  </label>
                  <input id="c-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="field mt-2" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-phone" className="label text-white/60">
                    Phone <span className="normal-case tracking-normal text-white/35">(optional)</span>
                  </label>
                  <input id="c-phone" type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} className="field mt-2" />
                </div>
                <div>
                  <label htmlFor="c-topic" className="label text-white/60">
                    Topic
                  </label>
                  <select id="c-topic" value={topic} onChange={e => setTopic(e.target.value as Topic)} className="field mt-2">
                    {CONTACT_TOPICS.map(t => (
                      <option key={t} value={t} className="bg-[#0e0619]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="c-msg" className="label text-white/60">
                  Message
                </label>
                <textarea id="c-msg" required rows={6} value={message} onChange={e => setMessage(e.target.value)} className="field mt-2 resize-y" />
              </div>
              <input
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="off"
                name="website"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              {errorText && (
                <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-200">
                  {errorText}
                </p>
              )}
              <button type="submit" disabled={send.isPending} className="btn btn-accent justify-self-start">
                {send.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                Send message
              </button>
            </form>
          )}
        </div>

        <aside className="reveal space-y-6">
          <div className="nebula card-sticker relative overflow-hidden p-7">
            <Logo className="h-auto w-36 -rotate-6" />
            <ul className="mt-6 space-y-4 text-white/85">
              {details.company && <li className="font-display text-xl">{details.company}</li>}
              {details.email && (
                <li>
                  <a href={`mailto:${details.email}`} className="inline-flex items-center gap-3 hover:text-white">
                    <Mail className="h-5 w-5 text-[var(--accent)]" /> {details.email}
                  </a>
                </li>
              )}
              {details.phone && (
                <li>
                  <a href={`tel:${details.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-3 hover:text-white">
                    <Phone className="h-5 w-5 text-[var(--accent)]" /> {details.phone}
                  </a>
                </li>
              )}
              {details.address && (
                <li className="inline-flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-none text-[var(--accent)]" /> {details.address}
                </li>
              )}
              {details.instagram && (
                <li>
                  <a href={details.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-white">
                    <Instagram className="h-5 w-5 text-[var(--accent)]" /> Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
          <Link href="/lab-reports" className="group card-sticker flex items-center gap-4 bg-white p-6 text-black transition-transform hover:-translate-y-1">
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border-[3px] border-black bg-[var(--accent)] text-white">
              <FlaskConical className="h-7 w-7" />
            </span>
            <span>
              <span className="block font-display text-xl uppercase">Looking for a lab report?</span>
              <span className="text-sm text-black/65">Search by batch number — it's faster than writing.</span>
            </span>
          </Link>
          <p className="flex items-center gap-2 text-sm text-white/50">
            <Spark className="h-3.5 w-3.5" /> For adults 21+ only.
          </p>
        </aside>
      </section>
    </PublicLayout>
  );
}
