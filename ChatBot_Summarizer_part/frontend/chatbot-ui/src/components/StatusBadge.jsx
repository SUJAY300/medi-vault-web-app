function StatusBadge({ metadata }) {
  const source = metadata?.source;
  const confidence = metadata?.confidence;

  const isLLM = source === "llm_fallback";

  return (
    <div className="flex items-center gap-4 text-xs font-medium">

      <div
        className={`px-2 py-1 rounded ${
          isLLM
            ? "bg-amber-100 text-amber-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {isLLM ? "AI-Assisted" : "Deterministic"}
      </div>

      {confidence && (
        <div
          className={`px-2 py-1 rounded ${
            confidence === "low"
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          Confidence: {confidence}
        </div>
      )}

    </div>
  );
}

export default StatusBadge;
