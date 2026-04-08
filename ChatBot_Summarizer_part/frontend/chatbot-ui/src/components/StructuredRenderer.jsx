function StructuredRenderer({ structured }) {
  if (!structured) {
    return (
      <div className="text-sm text-slate-500">
        Structured data not available.
      </div>
    );
  }

  const { type, label, payload } = structured;

  // SCALAR
  if (type === "scalar") {
    return (
      <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
        <div className="text-xs text-slate-600">{label}</div>
        <div className="text-xl font-semibold text-slate-900 mt-1">
          {payload.value}
        </div>
        {payload.unit && (
          <div className="text-sm text-slate-600">
            {payload.unit}
          </div>
        )}
        {payload.observed_at && (
          <div className="text-xs text-slate-500 mt-2">
            Observed: {payload.observed_at}
          </div>
        )}
        {payload.flag && (
          <div className="text-xs mt-1">
            Flag: {payload.flag}
          </div>
        )}
      </div>
    );
  }

  // BOOLEAN
  if (type === "boolean") {
    return (
      <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-lg mt-2">
          {payload.meaning}
        </div>
      </div>
    );
  }

  // SERIES
  if (type === "series") {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 text-sm font-medium">
          {label}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {payload.map((item, idx) => (
              <tr key={idx} className="border-t border-slate-200">
                <td className="px-4 py-2">{item.date}</td>
                <td className="px-4 py-2">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // SECTION
  if (type === "section") {
    return (
      <div className="border border-slate-200 rounded-md p-4 bg-slate-50">
        <div className="text-sm font-medium mb-2">{label}</div>
        <pre className="text-xs whitespace-pre-wrap text-slate-700">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    );
  }

  // TEXT (fallback)
  if (type === "text") {
    return (
      <div className="text-sm text-slate-700 whitespace-pre-wrap">
        {payload.text}
      </div>
    );
  }

  return (
    <div className="text-sm text-slate-500">
      Unsupported structured type.
    </div>
  );
}

export default StructuredRenderer;
