"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createCriteria,
  deleteCriteria,
  deleteSubCriteria,
  createSubCriteria,
  updateCriteria,
  updateSubCriteria,
} from "./actions";
import type { Criteria, SubCriteria } from "@/lib/supabase/types";

type CriteriaWithSubs = Criteria & { sub_criteria: SubCriteria[] };

const METRIC_OPTIONS = [
  { value: "avg_daily_sales", label: "Rata-rata Penjualan Harian" },
  { value: "coefficient_of_variation", label: "Variabilitas Penjualan (CV)" },
  { value: "movement_category", label: "Kategori Pergerakan" },
  { value: "stockout_days", label: "Hari Tanpa Penjualan" },
] as const;

type MetricKey = (typeof METRIC_OPTIONS)[number]["value"];

type CriteriaFormState = {
  code: string;
  name: string;
  type: "benefit" | "cost";
  metric_key: MetricKey;
  weight: string;
  description: string;
};

type SubCriteriaFormState = {
  label: string;
  value: string;
  rangeMin: string;
  rangeMax: string;
  description: string;
};

function AddCriteriaDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CriteriaFormState>({
    code: "",
    name: "",
    type: "benefit",
    metric_key: "avg_daily_sales",
    weight: "25",
    description: "",
  });

  function resetForm() {
    setForm({
      code: "",
      name: "",
      type: "benefit",
      metric_key: "avg_daily_sales",
      weight: "25",
      description: "",
    });
    setError("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const weightPct = parseFloat(form.weight);
    if (!form.code.trim() || !form.name.trim()) {
      setError("Kode dan nama kriteria wajib diisi.");
      return;
    }
    if (isNaN(weightPct) || weightPct <= 0 || weightPct > 100) {
      setError("Bobot harus antara 1 sampai 100.");
      return;
    }

    setError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.append("code", form.code.trim());
      fd.append("name", form.name.trim());
      fd.append("type", form.type);
      fd.append("metric_key", form.metric_key);
      fd.append("weight", String(weightPct));
      fd.append("description", form.description.trim());

      const result = await createCriteria(undefined, fd);
      if (result.error) {
        setError(result.error);
        return;
      }

      toast.success("Kriteria berhasil ditambahkan.");
      setOpen(false);
      resetForm();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm();
      }}
    >
      <DialogTrigger className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <Plus className="h-4 w-4" />
        Tambah Kriteria
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="min-w-0 flex-1">
            <DialogTitle>Tambah Kriteria</DialogTitle>
            <DialogDescription>
              Isi data kriteria baru untuk perhitungan safety stock.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-criteria-code">Kode</Label>
                <Input
                  id="new-criteria-code"
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Contoh: SS-C5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-criteria-type">Tipe</Label>
                <select
                  id="new-criteria-type"
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as "benefit" | "cost",
                    }))
                  }
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="benefit">Benefit</option>
                  <option value="cost">Cost</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-criteria-name">Nama Kriteria</Label>
              <Input
                id="new-criteria-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Contoh: Variabilitas Penjualan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-criteria-metric">Metrik</Label>
              <select
                id="new-criteria-metric"
                value={form.metric_key}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    metric_key: e.target.value as MetricKey,
                  }))
                }
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {METRIC_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-criteria-weight">Bobot (%)</Label>
              <Input
                id="new-criteria-weight"
                type="number"
                min="1"
                max="100"
                value={form.weight}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, weight: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-criteria-description">
                Deskripsi (opsional)
              </Label>
              <Textarea
                id="new-criteria-description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                placeholder="Tambahkan penjelasan singkat kriteria"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              type="button"
              className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Batal
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Tambah Kriteria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditCriteriaDialog({ criteria }: { criteria: Criteria }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<CriteriaFormState>({
    code: criteria.code,
    name: criteria.name,
    type: criteria.type,
    metric_key: (criteria.metric_key as MetricKey) ?? "avg_daily_sales",
    weight: (criteria.weight * 100).toFixed(0),
    description: criteria.description ?? "",
  });

  function resetForm() {
    setForm({
      code: criteria.code,
      name: criteria.name,
      type: criteria.type,
      metric_key: (criteria.metric_key as MetricKey) ?? "avg_daily_sales",
      weight: (criteria.weight * 100).toFixed(0),
      description: criteria.description ?? "",
    });
    setError("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const weightPct = parseFloat(form.weight);
    if (!form.code.trim() || !form.name.trim()) {
      setError("Kode dan nama kriteria wajib diisi.");
      return;
    }
    if (isNaN(weightPct) || weightPct <= 0 || weightPct > 100) {
      setError("Bobot harus antara 1 sampai 100.");
      return;
    }

    setError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", criteria.id);
      fd.append("code", form.code.trim());
      fd.append("name", form.name.trim());
      fd.append("type", form.type);
      fd.append("metric_key", form.metric_key);
      fd.append("weight", String(weightPct));
      fd.append("description", form.description.trim());

      const result = await updateCriteria(undefined, fd);
      if (result.error) {
        setError(result.error);
        return;
      }

      toast.success("Kriteria berhasil diperbarui.");
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) resetForm();
      }}
    >
      <DialogTrigger className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <Pencil className="h-3.5 w-3.5" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="min-w-0 flex-1">
            <DialogTitle>Edit Kriteria</DialogTitle>
            <DialogDescription>
              Ubah detail kriteria {criteria.code}.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`edit-code-${criteria.id}`}>Kode</Label>
                <Input
                  id={`edit-code-${criteria.id}`}
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edit-type-${criteria.id}`}>Tipe</Label>
                <select
                  id={`edit-type-${criteria.id}`}
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as "benefit" | "cost",
                    }))
                  }
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="benefit">Benefit</option>
                  <option value="cost">Cost</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-name-${criteria.id}`}>Nama Kriteria</Label>
              <Input
                id={`edit-name-${criteria.id}`}
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-metric-${criteria.id}`}>Metrik</Label>
              <select
                id={`edit-metric-${criteria.id}`}
                value={form.metric_key}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    metric_key: e.target.value as MetricKey,
                  }))
                }
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {METRIC_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-weight-${criteria.id}`}>Bobot (%)</Label>
              <Input
                id={`edit-weight-${criteria.id}`}
                type="number"
                min="1"
                max="100"
                value={form.weight}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, weight: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-description-${criteria.id}`}>
                Deskripsi (opsional)
              </Label>
              <Textarea
                id={`edit-description-${criteria.id}`}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              type="button"
              className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Batal
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddSubCriteriaDialog({ criteria }: { criteria: Criteria }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<SubCriteriaFormState>({
    label: "",
    value: "1",
    rangeMin: "",
    rangeMax: "",
    description: "",
  });

  function resetForm() {
    setForm({
      label: "",
      value: "1",
      rangeMin: "",
      rangeMax: "",
      description: "",
    });
    setError("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const parsedValue = parseInt(form.value, 10);
    if (!form.label.trim()) {
      setError("Label sub-kriteria wajib diisi.");
      return;
    }
    if (isNaN(parsedValue) || parsedValue < 1) {
      setError("Nilai sub-kriteria harus >= 1.");
      return;
    }

    setError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.append("criteria_id", criteria.id);
      fd.append("label", form.label.trim());
      fd.append("value", String(parsedValue));
      fd.append("range_min", form.rangeMin.trim());
      fd.append("range_max", form.rangeMax.trim());
      fd.append("description", form.description.trim());

      const result = await createSubCriteria(undefined, fd);
      if (result.error) {
        setError(result.error);
        return;
      }

      toast.success("Sub-kriteria berhasil ditambahkan.");
      setOpen(false);
      resetForm();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <Plus className="h-3 w-3" />
        Tambah Sub
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="min-w-0 flex-1">
            <DialogTitle>Tambah Sub-Kriteria</DialogTitle>
            <DialogDescription>
              Tambahkan sub-kriteria untuk {criteria.code}.
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={`new-sub-label-${criteria.id}`}>Label</Label>
              <Input
                id={`new-sub-label-${criteria.id}`}
                value={form.label}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Contoh: CV 0.3-0.6"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`new-sub-value-${criteria.id}`}>Nilai</Label>
                <Input
                  id={`new-sub-value-${criteria.id}`}
                  type="number"
                  min="1"
                  value={form.value}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, value: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`new-sub-min-${criteria.id}`}>Range Min</Label>
                <Input
                  id={`new-sub-min-${criteria.id}`}
                  type="number"
                  step="any"
                  value={form.rangeMin}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, rangeMin: e.target.value }))
                  }
                  placeholder="Opsional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`new-sub-max-${criteria.id}`}>Range Max</Label>
                <Input
                  id={`new-sub-max-${criteria.id}`}
                  type="number"
                  step="any"
                  value={form.rangeMax}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, rangeMax: e.target.value }))
                  }
                  placeholder="Opsional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`new-sub-description-${criteria.id}`}>
                Deskripsi (opsional)
              </Label>
              <Textarea
                id={`new-sub-description-${criteria.id}`}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              type="button"
              className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Batal
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Tambah Sub-Kriteria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditSubCriteriaDialog({ sub }: { sub: SubCriteria }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<SubCriteriaFormState>({
    label: sub.label,
    value: String(sub.value),
    rangeMin: sub.range_min === null ? "" : String(sub.range_min),
    rangeMax: sub.range_max === null ? "" : String(sub.range_max),
    description: sub.description ?? "",
  });

  function resetForm() {
    setForm({
      label: sub.label,
      value: String(sub.value),
      rangeMin: sub.range_min === null ? "" : String(sub.range_min),
      rangeMax: sub.range_max === null ? "" : String(sub.range_max),
      description: sub.description ?? "",
    });
    setError("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const parsedValue = parseInt(form.value, 10);
    if (!form.label.trim()) {
      setError("Label sub-kriteria wajib diisi.");
      return;
    }
    if (isNaN(parsedValue) || parsedValue < 1) {
      setError("Nilai sub-kriteria harus >= 1.");
      return;
    }

    setError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.append("id", sub.id);
      fd.append("label", form.label.trim());
      fd.append("value", String(parsedValue));
      fd.append("range_min", form.rangeMin.trim());
      fd.append("range_max", form.rangeMax.trim());
      fd.append("description", form.description.trim());
      const result = await updateSubCriteria(undefined, fd);

      if (result.error) {
        setError(result.error);
        return;
      }

      toast.success("Sub-kriteria berhasil diperbarui.");
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <Pencil className="h-3 w-3" />
        Edit
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="min-w-0 flex-1">
            <DialogTitle>Edit Sub-Kriteria</DialogTitle>
            <DialogDescription>{sub.label}</DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={`sub-label-${sub.id}`}>Label</Label>
              <Input
                id={`sub-label-${sub.id}`}
                value={form.label}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, label: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor={`sub-value-${sub.id}`}>Nilai</Label>
                <Input
                  id={`sub-value-${sub.id}`}
                  type="number"
                  min="1"
                  value={form.value}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, value: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`sub-min-${sub.id}`}>Range Min</Label>
                <Input
                  id={`sub-min-${sub.id}`}
                  type="number"
                  step="any"
                  value={form.rangeMin}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, rangeMin: e.target.value }))
                  }
                  placeholder="Opsional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`sub-max-${sub.id}`}>Range Max</Label>
                <Input
                  id={`sub-max-${sub.id}`}
                  type="number"
                  step="any"
                  value={form.rangeMax}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, rangeMax: e.target.value }))
                  }
                  placeholder="Opsional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`sub-description-${sub.id}`}>
                Deskripsi (opsional)
              </Label>
              <Textarea
                id={`sub-description-${sub.id}`}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              type="button"
              className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Batal
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CriteriaTable({ criteria }: { criteria: CriteriaWithSubs[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);

  async function handleDelete(item: CriteriaWithSubs) {
    if (deletingId) return;

    const confirmed = confirm(`Hapus kriteria ${item.code} - ${item.name}?`);
    if (!confirmed) return;

    setDeletingId(item.id);
    const result = await deleteCriteria(item.id);
    setDeletingId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Kriteria berhasil dihapus.");
  }

  async function handleDeleteSub(item: SubCriteria) {
    if (deletingSubId) return;

    const confirmed = confirm(`Hapus sub-kriteria ${item.label}?`);
    if (!confirmed) return;

    setDeletingSubId(item.id);
    const result = await deleteSubCriteria(item.id);
    setDeletingSubId(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Sub-kriteria berhasil dihapus.");
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-start justify-between gap-3 border-b border-border bg-muted/20 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Tabel Kriteria
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Kelola data kriteria utama untuk perhitungan safety stock.
            </p>
          </div>
          <AddCriteriaDialog />
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="w-14 px-4 py-3 text-left font-medium text-muted-foreground">
                No
              </th>
              <th className="w-24 px-4 py-3 text-left font-medium text-muted-foreground">
                Kode
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Nama Kriteria
              </th>
              <th className="w-24 px-4 py-3 text-center font-medium text-muted-foreground">
                Tipe
              </th>
              <th className="w-28 px-4 py-3 text-center font-medium text-muted-foreground">
                Bobot
              </th>
              <th className="w-28 px-4 py-3 text-center font-medium text-muted-foreground">
                Jumlah Sub
              </th>
              <th className="w-24 px-4 py-3 text-center font-medium text-muted-foreground">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((c, idx) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {idx + 1}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {c.code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{c.name}</p>
                  {c.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {c.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <TypeBadge type={c.type} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="tabular-nums font-semibold text-foreground">
                    {(c.weight * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-muted px-2 py-1 text-xs font-medium tabular-nums text-foreground">
                    {c.sub_criteria.length}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <EditCriteriaDialog criteria={c} />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => handleDelete(c)}
                      disabled={deletingId === c.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border bg-muted/20 px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            Tabel Sub-Kriteria
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Setiap kriteria ditampilkan terpisah agar lebih mudah mengubah nilai
            detail.
          </p>
        </div>

        <div className="divide-y divide-border">
          {criteria.map((c) => {
            const sorted = [...c.sub_criteria].sort(
              (a, b) => a.value - b.value,
            );

            return (
              <div key={c.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {c.code}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">
                    {c.name}
                  </h3>
                  <TypeBadge type={c.type} />
                  <span className="text-xs text-muted-foreground">
                    Bobot: {(c.weight * 100).toFixed(0)}%
                  </span>
                  <AddSubCriteriaDialog criteria={c} />
                </div>

                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="w-14 px-3 py-2.5 text-left font-medium text-muted-foreground">
                          No
                        </th>
                        <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                          Sub-Kriteria
                        </th>
                        <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">
                          Nilai
                        </th>
                        <th className="w-44 px-3 py-2.5 text-center font-medium text-muted-foreground">
                          Range
                        </th>
                        <th className="w-24 px-3 py-2.5 text-center font-medium text-muted-foreground">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-3 py-4 text-center text-xs italic text-muted-foreground"
                          >
                            Belum ada sub-kriteria.
                          </td>
                        </tr>
                      ) : (
                        sorted.map((sub, idx) => (
                          <tr
                            key={sub.id}
                            className="border-b border-border last:border-0"
                          >
                            <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2.5">
                              <p className="text-sm text-foreground">
                                {sub.label}
                              </p>
                              {sub.description && (
                                <p className="text-xs text-muted-foreground">
                                  {sub.description}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="tabular-nums font-semibold text-foreground">
                                {sub.value}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                              {formatRange(sub)}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex justify-center gap-1.5">
                                <EditSubCriteriaDialog sub={sub} />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon-sm"
                                  onClick={() => handleDeleteSub(sub)}
                                  disabled={deletingSubId === sub.id}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function formatRange(sub: SubCriteria) {
  const hasMin = sub.range_min !== null;
  const hasMax = sub.range_max !== null;

  if (!hasMin && !hasMax) return "-";
  if (hasMin && hasMax) return `${sub.range_min} - ${sub.range_max}`;
  if (hasMin) return `>= ${sub.range_min}`;
  return `<= ${sub.range_max}`;
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium",
        type === "benefit"
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      )}
    >
      {type === "benefit" ? "Benefit" : "Cost"}
    </span>
  );
}
