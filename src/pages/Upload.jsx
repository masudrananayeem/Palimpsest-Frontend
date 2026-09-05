import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ScanLine, ShieldCheck, AlertTriangle, CloudUpload, Sparkles } from "lucide-react";
import UploadDropzone from "../components/UploadDropzone";
import PhotoRelief3D from "../components/PhotoRelief3D";
import { categories } from "../data/artifacts";
import { useAuth } from "../context/AuthContext";
import { createArtifact } from "../lib/artifactsRepo";
import { uploadToCloudinary, isCloudinaryConfigured } from "../lib/cloudinary";

const steps = ["Details", "Files", "Review & submit"];
const SHAPE_BY_CATEGORY = {
  Ceramics: "amphora",
  Stonework: "stele",
  "Wood & Organic": "mask",
  Epigraphy: "tablet",
  Metalwork: "coins",
};

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // holds created artifact id
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: categories[1],
    era: "",
    origin: "",
    condition: "",
    notes: "",
  });

  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);
  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const coverImageFile = useMemo(() => files.find((f) => f.type.startsWith("image/")) || null, [files]);
  const [previewUrl, setPreviewUrl] = useState(null);
  useEffect(() => {
    if (!coverImageFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(coverImageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverImageFile]);

  const canAdvance = () => {
    if (step === 0) return form.title.trim() && form.era.trim();
    if (step === 1) return files.length > 0 && totalSize <= 2 * 1024 * 1024 * 1024;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg("");
    setUploadProgress(0);
    try {
      let imageUrl = null;
      const imageFile = files.find((f) => f.type.startsWith("image/"));

      if (imageFile && isCloudinaryConfigured) {
        const result = await uploadToCloudinary(imageFile, {
          folder: `palimpsest/${user.uid}`,
          onProgress: setUploadProgress,
        });
        imageUrl = result.url;
      }

      const id = await createArtifact(
        {
          title: form.title.trim(),
          category: form.category,
          era: form.era.trim(),
          origin: form.origin.trim() || "Not specified",
          condition: form.condition.trim() || "Awaiting curator assessment",
          description: form.notes.trim() || "No additional notes provided by the contributor.",
          scans: files.length,
          meshVerts: "Pending",
          shape: SHAPE_BY_CATEGORY[form.category] || "amphora",
          thumbnailTone: "#7FDCE0",
          imageUrl,
          fileCount: files.length,
          totalBytes: totalSize,
        },
        user
      );
      setSubmitted(id);
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(null);
    setStep(0);
    setFiles([]);
    setForm({ title: "", category: categories[1], era: "", origin: "", condition: "", notes: "" });
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <CheckCircle2 className="w-12 h-12 text-verdigris-bright mx-auto" />
        <h1 className="mt-6 text-3xl">Submission queued</h1>
        <p className="mt-3 text-bone-dim leading-relaxed">
          "{form.title}" has been saved to the archive database and is now waiting for
          curator review. You'll see it under your dashboard immediately.
        </p>
        <div className="mt-7 panel p-4 text-left flex gap-3">
          <ShieldCheck className="w-5 h-5 text-verdigris-bright shrink-0" />
          <p className="text-xs text-bone-dim leading-relaxed">
            This record is linked to your account and only you (and curators) can see it in your
            dashboard until it's published.
          </p>
        </div>
        <div className="mt-8 flex gap-3 justify-center">
          <button className="btn-ghost" onClick={reset}>Submit another scan</button>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>Go to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16">
      <span className="eyebrow flex items-center gap-2"><ScanLine className="w-3.5 h-3.5" /> Submit a scan</span>
      <h1 className="mt-4 text-4xl sm:text-5xl">Add a new artifact record.</h1>
      <p className="mt-4 text-bone-dim max-w-xl leading-relaxed">
        Create a structured record, attach your scan files, and submit it to the review queue —
        saved under your account as {user?.displayName || user?.email}.
      </p>

      {!isCloudinaryConfigured && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-rust-bright/40 bg-rust/5 p-4 text-sm text-bone-dim">
          <AlertTriangle className="w-4 h-4 text-rust-bright shrink-0 mt-0.5" />
          <p>
            Cloudinary isn't connected yet, so files won't be uploaded — only the record's text
            metadata will be saved. Add your keys to <code className="text-bone">frontend/.env</code> and
            deploy the <code className="text-bone">backend/</code> worker to enable file uploads.
          </p>
        </div>
      )}

      <div className="mt-10 flex items-center gap-3">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2.5">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border ${i <= step ? "border-scan text-scan bg-scan/10" : "border-ink-line text-bone-faint"}`}>{i + 1}</span>
              <span className={`text-sm hidden sm:inline ${i <= step ? "text-bone" : "text-bone-faint"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-scan" : "bg-ink-line"}`} />}
          </div>
        ))}
      </div>

      <div className="mt-10 panel p-6 sm:p-8">
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Artifact title" required><input value={form.title} onChange={update("title")} placeholder="e.g. Terracotta Amphora, Fragment Set" className="field" /></Field>
            <Field label="Category"><select value={form.category} onChange={update("category")} className="field">{categories.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}</select></Field>
            <Field label="Era / date" required><input value={form.era} onChange={update("era")} placeholder="e.g. Greek, c. 520 BCE" className="field" /></Field>
            <Field label="Origin / find site"><input value={form.origin} onChange={update("origin")} placeholder="e.g. Attica region" className="field" /></Field>
            <Field label="Condition notes" className="sm:col-span-2"><input value={form.condition} onChange={update("condition")} placeholder="e.g. Reconstructed, 62% original material" className="field" /></Field>
            <Field label="Additional notes" className="sm:col-span-2"><textarea value={form.notes} onChange={update("notes")} rows={4} placeholder="Anything curators should know before reviewing this scan." className="field resize-none" /></Field>
          </div>
        )}

        {step === 1 && (
          <div>
            <UploadDropzone files={files} setFiles={setFiles} />
            <div className={`mt-4 flex items-start gap-3 rounded-lg border p-4 ${totalSize > 2 * 1024 * 1024 * 1024 ? "border-rust-bright/50 bg-rust/5" : "border-ink-line"}`}>
              {totalSize > 2 * 1024 * 1024 * 1024 ? <AlertTriangle className="w-4 h-4 text-rust-bright shrink-0" /> : <ShieldCheck className="w-4 h-4 text-verdigris-bright shrink-0" />}
              <p className="text-xs text-bone-dim">Selected: {(totalSize / (1024 * 1024)).toFixed(1)} MB · submission limit: 2 GB. The first image file becomes the cover photo.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wide text-bone-faint mb-4">Review before submitting</p>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <Row label="Title" value={form.title || "—"} />
              <Row label="Category" value={form.category} />
              <Row label="Era" value={form.era || "—"} />
              <Row label="Origin" value={form.origin || "—"} />
              <Row label="Condition" value={form.condition || "—"} />
              <Row label="Files attached" value={`${files.length} file${files.length === 1 ? "" : "s"}`} />
            </dl>
            {form.notes && <div className="mt-4"><p className="font-mono text-[10px] uppercase tracking-wide text-bone-faint mb-1.5">Notes</p><p className="text-sm text-bone-dim">{form.notes}</p></div>}

            {submitting && isCloudinaryConfigured && (
              <div className="mt-6">
                <div className="flex items-center gap-2 text-xs text-bone-dim mb-2"><CloudUpload className="w-3.5 h-3.5" /> Uploading cover image… {uploadProgress}%</div>
                <div className="h-1.5 rounded-full bg-ink-line overflow-hidden"><div className="h-full bg-scan transition-all" style={{ width: `${uploadProgress}%` }} /></div>
              </div>
            )}
            {errorMsg && <p className="mt-4 text-sm text-rust-bright">{errorMsg}</p>}

            {previewUrl && (
              <div className="mt-6">
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-bone-faint mb-3"><Sparkles className="w-3.5 h-3.5 text-scan" /> 3D preview of your cover photo</p>
                <PhotoRelief3D src={previewUrl} height={280} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-ghost disabled:opacity-30 disabled:pointer-events-none">Back</button>
        {step < steps.length - 1 ? (
          <button onClick={() => canAdvance() && setStep((s) => s + 1)} disabled={!canAdvance()} className="btn-primary disabled:opacity-30 disabled:pointer-events-none">Continue</button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary min-w-[160px] justify-center">{submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit for review"}</button>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return <label className={`block ${className}`}><span className="font-mono text-[10px] uppercase tracking-wide text-bone-faint">{label} {required && <span className="text-rust-bright">*</span>}</span><div className="mt-2">{children}</div></label>;
}

function Row({ label, value }) {
  return <div className="flex justify-between border-b border-ink-line pb-2"><dt className="text-bone-faint font-mono text-xs uppercase">{label}</dt><dd className="text-bone text-right">{value}</dd></div>;
}
