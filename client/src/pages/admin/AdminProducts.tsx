import {
  AdminLayout,
  Card,
  Field,
  buttonClass,
  ghostButtonClass,
  inputClass,
} from "@/components/AdminLayout";
import { useR2Upload } from "@/hooks/useR2Upload";
import type { RouterOutputs } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";
import { STRAINS, isHexColor, type Strain } from "@shared/const";
import { groupByLine, LINES } from "@shared/lines";
import {
  ChevronDown,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AdminProduct = RouterOutputs["catalog"]["adminProducts"][number];

const DEFAULT_ACCENT = "#ff7a18";

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const products = trpc.catalog.adminProducts.useQuery(undefined, {
    retry: false,
  });

  const [name, setName] = useState("");
  const [collection, setCollection] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [strain, setStrain] = useState<Strain | "">("");
  const [accent, setAccent] = useState(DEFAULT_ACCENT);

  const refresh = () => {
    utils.catalog.invalidate();
    utils.adminAuth.dashboardOverview.invalidate();
  };

  const create = trpc.catalog.createProduct.useMutation({
    onSuccess: () => {
      setName("");
      refresh();
      toast.success("Product created. Open it below to add the photo and description.");
    },
    onError: e => toast.error(e.message || "Could not create product"),
  });

  // Lines already in use, plus the standard ones, as suggestions.
  const lineNames = Array.from(
    new Set([
      ...LINES.map(l => l.name),
      ...(products.data ?? []).map(p => p.collection).filter(Boolean),
    ])
  ) as string[];

  const groups = groupByLine(products.data ?? []);

  return (
    <AdminLayout title="Products">
      <datalist id="line-names">
        {lineNames.map(n => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <Card
        title="New product"
        description="One product per strain and format. Lab reports are attached to a product, so it has to exist first."
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!name.trim()) {
              toast.error("The product needs a name");
              return;
            }
            create.mutate({
              name: name.trim(),
              collection: collection.trim() || null,
              subtitle: subtitle.trim() || null,
              strain: strain || null,
              accentColor: accent,
            });
          }}
          className="grid gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Product line" hint="The heading it's grouped under.">
              <input
                list="line-names"
                value={collection}
                onChange={e => setCollection(e.target.value)}
                placeholder="THC Badder"
                className={inputClass}
              />
            </Field>
            <Field label="Strain name">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Blue Dream"
                className={inputClass}
              />
            </Field>
            <Field label="Type">
              <StrainSelect value={strain} onChange={setStrain} />
            </Field>
            <Field label="Label colour">
              <AccentInput value={accent} onChange={setAccent} />
            </Field>
          </div>
          <Field label="Format" hint="The line under the name on the site.">
            <input
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              placeholder="10 count, 2.0G per pre-roll"
              className={inputClass}
            />
          </Field>
          <div>
            <button type="submit" disabled={create.isPending} className={buttonClass}>
              {create.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create product
            </button>
          </div>
        </form>
      </Card>

      <div className="mt-8 space-y-8">
        {products.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        ) : groups.length ? (
          groups.map(group => (
            <section key={group.name}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
                {group.name} · {group.items.length}
              </h2>
              <div className="space-y-2">
                {group.items.map(p => (
                  <ProductRow key={p.id} product={p} onChanged={refresh} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-white/40">
            No products yet. Create the first one above.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StrainSelect({
  value,
  onChange,
}: {
  value: Strain | "";
  onChange: (value: Strain | "") => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as Strain | "")}
      className={inputClass}
    >
      <option value="">Not set</option>
      {STRAINS.map(s => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}

/** Colour picker and hex field kept in step: pick by eye or paste the value. */
function AccentInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="color"
        aria-label="Pick the label colour"
        value={isHexColor(value) && value.length === 7 ? value : DEFAULT_ACCENT}
        onChange={e => onChange(e.target.value)}
        className="h-[42px] w-12 shrink-0 cursor-pointer rounded-xl border border-white/15 bg-black p-1"
      />
      <input
        value={value}
        onChange={e => onChange(e.target.value.trim())}
        placeholder="#19c8f0"
        className={`${inputClass} font-mono`}
      />
    </div>
  );
}

function ProductRow({
  product,
  onChanged,
}: {
  product: AdminProduct;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#131315]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-4 py-3 text-left"
      >
        <span
          className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black"
          style={{ boxShadow: `inset 0 -3px 0 ${product.accentColor ?? "transparent"}` }}
        >
          {product.imageUrl && (
            <img src={product.imageUrl} alt="" className="h-full w-full object-contain p-1" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{product.name}</span>
          <span className="block truncate text-xs text-white/45">
            {[
              product.strain,
              product.subtitle,
              `${product.reports.length} report${product.reports.length === 1 ? "" : "s"}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        {!product.published && (
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/60">
            Hidden
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {/* Mounted only while open: eighteen forms' worth of state would
          otherwise sit in memory for rows nobody is editing. */}
      {open && <ProductEditor product={product} onChanged={onChanged} />}
    </div>
  );
}

function ProductEditor({
  product,
  onChanged,
}: {
  product: AdminProduct;
  onChanged: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [collection, setCollection] = useState(product.collection ?? "");
  const [subtitle, setSubtitle] = useState(product.subtitle ?? "");
  const [strain, setStrain] = useState<Strain | "">(product.strain ?? "");
  const [accent, setAccent] = useState(product.accentColor ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [sortOrder, setSortOrder] = useState(product.sortOrder);
  const { upload, progress, isUploading } = useR2Upload();

  const update = trpc.catalog.updateProduct.useMutation({
    onSuccess: () => {
      onChanged();
      toast.success("Saved");
    },
    onError: e => toast.error(e.message || "Could not save"),
  });

  const remove = trpc.catalog.deleteProduct.useMutation({
    onSuccess: () => {
      onChanged();
      toast.success("Product deleted");
    },
    onError: e => toast.error(e.message || "Could not delete"),
  });

  /* Which of the two photos is uploading, so only that one shows progress. */
  const [uploadingSlot, setUploadingSlot] = useState<"main" | "alt" | null>(null);

  const onImage =
    (slot: "main" | "alt") => async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingSlot(slot);
      try {
        const up = await upload(file, "product-image");
        update.mutate(
          slot === "main"
            ? { id: product.id, imageUrl: up.publicUrl, imageKey: up.storageKey }
            : { id: product.id, altImageUrl: up.publicUrl, altImageKey: up.storageKey }
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploadingSlot(null);
        e.target.value = "";
      }
    };

  const save = () => {
    if (!name.trim()) {
      toast.error("The product needs a name");
      return;
    }
    if (accent && !isHexColor(accent)) {
      toast.error("The label colour must be a hex value like #19c8f0");
      return;
    }
    update.mutate({
      id: product.id,
      name: name.trim(),
      collection: collection.trim() || null,
      subtitle: subtitle.trim() || null,
      strain: strain || null,
      accentColor: accent || null,
      description: description.trim() || null,
      sortOrder,
    });
  };

  return (
    <div className="border-t border-white/10 p-5">
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex shrink-0 gap-4 sm:flex-col">
          <PhotoSlot
            label="Main photo"
            src={product.imageUrl}
            alt={product.name}
            busy={isUploading && uploadingSlot === "main" ? progress : null}
            onPick={onImage("main")}
          />
          <PhotoSlot
            label="Second photo"
            hint="Optional. The other pack, like the display box."
            src={product.altImageUrl}
            alt={`${product.name}, second photo`}
            busy={isUploading && uploadingSlot === "alt" ? progress : null}
            onPick={onImage("alt")}
            onRemove={
              product.altImageUrl
                ? () =>
                    update.mutate({
                      id: product.id,
                      altImageUrl: null,
                      altImageKey: null,
                    })
                : undefined
            }
          />
        </div>

        <div className="grid flex-1 gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Product line">
              <input
                list="line-names"
                value={collection}
                onChange={e => setCollection(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Strain name">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Type">
              <StrainSelect value={strain} onChange={setStrain} />
            </Field>
            <Field label="Label colour">
              <AccentInput value={accent} onChange={setAccent} />
            </Field>
          </div>
          <Field label="Format">
            <input
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sort order" hint="Lower appears first within its line.">
              <input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(Number(e.target.value) || 0)}
                className={inputClass}
              />
            </Field>
            <Field label="Page address">
              <input
                value={`/products/${product.slug}`}
                readOnly
                className={`${inputClass} bg-white/[0.04] text-white/50`}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={save} disabled={update.isPending} className={buttonClass}>
              {update.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </button>

            <button
              onClick={() =>
                update.mutate({ id: product.id, published: !product.published })
              }
              className={ghostButtonClass}
            >
              {product.published ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {product.published ? "Published" : "Hidden"}
            </button>

            <button
              onClick={() => {
                if (
                  confirm(
                    `Delete "${product.name}"? Its ${product.reports.length} lab report(s) and their PDFs will be deleted too.`
                  )
                ) {
                  remove.mutate({ id: product.id });
                }
              }}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/40 hover:bg-red-500/15 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoSlot({
  label,
  hint,
  src,
  alt,
  busy,
  onPick,
  onRemove,
}: {
  label: string;
  hint?: string;
  src: string | null;
  alt: string;
  busy: number | null;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="w-28">
      <p className="mb-1.5 text-xs font-semibold text-white/60">{label}</p>
      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl bg-black">
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-contain p-1.5" />
        ) : (
          <ImagePlus className="h-6 w-6 text-white/50" />
        )}
      </div>
      <label className="mt-2 block cursor-pointer text-center text-xs font-semibold text-white/60 underline underline-offset-2 hover:text-white">
        {busy !== null ? `Uploading ${busy}%` : src ? "Change photo" : "Add photo"}
        <input type="file" accept="image/*" onChange={onPick} className="hidden" />
      </label>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-1 block w-full text-center text-xs text-white/40 hover:text-red-300"
        >
          Remove
        </button>
      )}
      <p className="mt-1 text-center text-[11px] leading-tight text-white/35">
        {hint ?? "Transparent PNG or WebP looks best"}
      </p>
    </div>
  );
}
