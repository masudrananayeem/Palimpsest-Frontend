import { useCallback, useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X, AlertTriangle } from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;
const allowed = [".obj", ".stl", ".ply", ".glb", ".gltf"];

export default function UploadDropzone({ files, setFiles }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList);
    const invalid = incoming.find((file) => {
      const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
      return !allowed.includes(ext) && !file.type.startsWith("image/");
    });
    if (invalid) {
      setError(`${invalid.name} is not a supported scan/photo file.`);
      return;
    }
    if (incoming.some((file) => file.size > MAX_FILE_SIZE)) {
      setError("A file exceeds the 2 GB per-submission limit.");
      return;
    }
    setError("");
    setFiles((prev) => {
      const existing = new Set(prev.map((file) => `${file.name}-${file.size}`));
      const unique = incoming.filter((file) => !existing.has(`${file.name}-${file.size}`));
      return [...prev, ...unique];
    });
  }, [setFiles]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-200 ${dragOver ? "border-scan bg-scan/5" : "border-ink-line hover:border-bone/30"}`}
      >
        <input ref={inputRef} type="file" multiple accept=".obj,.stl,.ply,.glb,.gltf,image/*" className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
        <UploadCloud className="w-9 h-9 mx-auto text-scan mb-4" />
        <p className="font-body text-bone">Drag scan files here, or <span className="text-scan underline underline-offset-4">browse</span></p>
        <p className="font-mono text-xs text-bone-faint mt-2">OBJ · STL · PLY · GLTF/GLB · photos</p>
      </div>

      {error && <div className="mt-3 flex gap-2 items-start text-xs text-rust-bright"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}

      {files.length > 0 && (
        <ul className="mt-4 divide-y divide-ink-line panel">
          {files.map((f, idx) => (
            <li key={`${f.name}-${idx}`} className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-3 text-sm text-bone min-w-0">
                <FileIcon className="w-4 h-4 text-verdigris-bright shrink-0" />
                <span className="truncate">{f.name}</span>
                <span className="font-mono text-xs text-bone-faint shrink-0">{(f.size / (1024 * 1024)).toFixed(1)} MB</span>
              </span>
              <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="text-bone-faint hover:text-rust-bright transition-colors" aria-label={`Remove ${f.name}`}><X className="w-4 h-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
