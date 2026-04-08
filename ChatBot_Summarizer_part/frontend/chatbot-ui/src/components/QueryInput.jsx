import { useState, useEffect } from "react";

function QueryInput({ onSend, onClear, loading }) {
  const [query, setQuery] = useState("");

  const handleSend = () => {
    if (!query.trim()) return;
    onSend(query);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
  const handleKey = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      onClear();
    }
  };

  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [onClear]);


  return (
    <div className="border-t border-slate-200 bg-white px-8 py-5 shadow-inner">
      <div className="max-w-5xl mx-auto">
<textarea
  rows="2"
  value={query}
  disabled={loading}
  onChange={(e) => setQuery(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Enter clinical query (e.g., latest creatinine)"
  className="w-full border border-slate-300 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
/>


        <div className="flex justify-between mt-3">
          <button
            onClick={onClear}
            className="bg-blue-600 text-white px-5 py-2 text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            Clear History
          </button>

<button
  onClick={handleSend}
  disabled={loading || !query.trim()}
  className="bg-blue-600 text-white px-5 py-2 text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? "Processing..." : "Submit"}
</button>

        </div>
      </div>
    </div>
  );
}

export default QueryInput;
