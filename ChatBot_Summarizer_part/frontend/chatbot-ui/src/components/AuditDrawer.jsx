import { useState } from "react";

function AuditDrawer({ metadata }) {
  const [open, setOpen] = useState(false);

  if (!metadata) return null;

  return (
    <div className="mt-4 border-t border-slate-200 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-slate-500 hover:text-slate-700 font-medium"
      >
        {open ? "Hide Audit Details ▲" : "Show Audit Details ▼"}
      </button>

      {open && (
        <div className="mt-3 text-xs text-slate-600 space-y-3 bg-slate-50 border border-slate-200 rounded-md p-4">

          {/* Source */}
          {metadata.source && (
            <div>
              <span className="font-medium text-slate-700">Source:</span>{" "}
              {metadata.source}
            </div>
          )}

          {/* Confidence */}
          {metadata.confidence && (
            <div>
              <span className="font-medium text-slate-700">Confidence:</span>{" "}
              {metadata.confidence}
            </div>
          )}

          {/* Section Anchoring */}
          {metadata.used_sections &&
            metadata.used_sections.length > 0 && (
              <div>
                <span className="font-medium text-slate-700">
                  Source Section:
                </span>{" "}
                {metadata.used_sections.join(", ")}
              </div>
            )}

          {/* Citations */}
          {metadata.citations &&
            metadata.citations.length > 0 && (
              <div>
                <span className="font-medium text-slate-700">
                  Citations:
                </span>{" "}
                {metadata.citations.join(", ")}
              </div>
            )}

          {/* Timestamp */}
          {metadata.generated_at && (
            <div>
              <span className="font-medium text-slate-700">
                Generated At:
              </span>{" "}
              {new Date(metadata.generated_at).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuditDrawer;
