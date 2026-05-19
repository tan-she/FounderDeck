import { useState, useRef } from "react";
import { mediaUrl } from "../../utils/mediaUrl";
import { Trash2, Upload } from "lucide-react";

/**
 * Props:
 *  existingFiles  – array of stored paths (from pitch.deck_files)
 *  onChange       – cb(newFiles: File[], removedPaths: string[])
 */
export default function DeckUploader({ existingFiles = [], onChange }) {
  const [previews, setPreviews] = useState(
    existingFiles.map((path) => ({ type: "existing", path, url: mediaUrl(path) }))
  );
  const [newFiles, setNewFiles] = useState([]);
  const [toRemove, setToRemove] = useState([]);
  const inputRef = useRef();

  const handleAdd = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((f) => ({
      type: "new",
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    const updated = [...previews, ...newPreviews];
    const updatedNew = [...newFiles, ...files];
    setPreviews(updated);
    setNewFiles(updatedNew);
    onChange(updatedNew, toRemove);
    e.target.value = ""; // reset so same file can be re-added
  };

  const handleRemove = (idx) => {
    const item = previews[idx];
    let updatedRemove = toRemove;
    let updatedNew = newFiles;

    if (item.type === "existing") {
      updatedRemove = [...toRemove, item.path];
      setToRemove(updatedRemove);
    } else {
      URL.revokeObjectURL(item.url);
      updatedNew = newFiles.filter((_, i) => i !== previews.slice(0, idx).filter(p => p.type === "new").length);
      setNewFiles(updatedNew);
    }

    const updatedPreviews = previews.filter((_, i) => i !== idx);
    setPreviews(updatedPreviews);
    onChange(updatedNew, updatedRemove);
  };

  const isDocument = (name = "") => {
    const lower = name.toLowerCase();
    return lower.endsWith(".pdf") || lower.endsWith(".ppt") || lower.endsWith(".pptx");
  };

  const getDocIcon = (name = "") => {
    const lower = name.toLowerCase();
    if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "📊";
    return "📄";
  };

  return (
    <div className="space-y-3">
      {/* Slide grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((item, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video">
              {isDocument(item.path ?? item.name) ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                  <span className="text-2xl">{getDocIcon(item.path ?? item.name)}</span>
                  <span className="text-center px-1 truncate w-full text-center">
                    {item.name ?? item.path?.split("/").pop()}
                  </span>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Slide number badge */}
              <span className="absolute top-1 left-1 bg-black/50 text-white text-xs rounded px-1.5 py-0.5">
                {idx + 1}
              </span>
              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <button
        type="button"
        onClick={() => inputRef.current.click()}
        className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-[#FF5C00] hover:text-[#FF5C00] transition-colors cursor-pointer"
      >
        <Upload size={20} />
        <span className="text-sm font-medium">Upload slides</span>
        <span className="text-xs">PNG, JPG, WebP, PDF, PPT or PPTX · Max 20 MB each</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.ppt,.pptx"
        className="hidden"
        onChange={handleAdd}
      />
    </div>
  );
}
