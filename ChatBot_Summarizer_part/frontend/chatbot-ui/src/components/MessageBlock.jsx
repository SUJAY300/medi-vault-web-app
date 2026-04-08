import { useState } from "react";
import AuditDrawer from "./AuditDrawer";
import StatusBadge from "./StatusBadge";
import StructuredRenderer from "./StructuredRenderer";

function MessageBlock({ message }) {
  const isDoctor = message.role === "doctor";
  const [structuredView, setStructuredView] = useState(false);

  const isLLM = message.metadata?.source === "llm_fallback";
  const isLowConfidence = message.metadata?.confidence === "low";

  return (
    <div className={`flex ${isDoctor ? "justify-end" : "justify-start"}`}>
      <div
        className={`w-full max-w-3xl rounded-lg px-6 py-5 ${
          isDoctor
            ? "bg-blue-50 border border-blue-200"
            : `
              bg-white shadow-sm border border-slate-200
              ${isLLM ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-blue-500"}
              ${isLowConfidence ? "bg-amber-50/20" : ""}
            `
        }`}
      >
        {isDoctor && (
          <>
            <div className="text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">
              {message.text}
            </div>
            <div className="text-xs text-slate-400 mt-4">
              {new Date(message.timestamp).toLocaleString()}
            </div>
          </>
        )}

        {!isDoctor && (
          <>
            <div className="flex justify-between items-center mb-3 border-b border-slate-200 pb-2">
              <div className="text-sm font-semibold text-slate-800">
                Clinical Response
              </div>

              <button
                onClick={() => setStructuredView(!structuredView)}
                className="text-xs text-blue-600 hover:underline"
              >
                {structuredView ? "Natural View" : "Structured View"}
              </button>
            </div>

            {message.metadata && (
              <div className="mb-4">
                <StatusBadge metadata={message.metadata} />
              </div>
            )}

            {!structuredView && (
              <div className="text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                {message.text}
              </div>
            )}

            {structuredView && (
              <StructuredRenderer structured={message.structured} />
            )}

            <div className="text-xs text-slate-400 mt-4">
              {new Date(message.timestamp).toLocaleString()}
            </div>

            {message.metadata && (
              <AuditDrawer metadata={message.metadata} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MessageBlock;
