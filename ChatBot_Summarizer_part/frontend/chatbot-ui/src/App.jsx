// import { useState } from "react";

// function App() {
//   const [query, setQuery] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [metadata, setMetadata] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const sendQuery = async () => {
//     if (!query.trim()) return;

//     setLoading(true);
//     setAnswer("");
//     setMetadata(null);

//     try {
//       const res = await fetch("http://127.0.0.1:8000/query/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ query }),
//       });

//       const data = await res.json();

//       setAnswer(data.answer);
//       setMetadata(data.metadata);
//     } catch (error) {
//       setAnswer("Backend not reachable.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div style={{ padding: "40px", fontFamily: "Arial", maxWidth: "800px", margin: "auto" }}>
//       <h1>Clinical Patient Query Tool</h1>
//       <p style={{ color: "#555" }}>
//         Deterministic + Validated AI-Assisted Medical Query Engine
//       </p>

//       <textarea
//         rows="4"
//         style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
//         placeholder="Enter clinical query (e.g., latest creatinine)"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//       />

//       <button
//         onClick={sendQuery}
//         disabled={loading}
//         style={{ padding: "10px 20px", cursor: "pointer" }}
//       >
//         {loading ? "Processing..." : "Submit"}
//       </button>

//       {answer && (
//         <div style={{ marginTop: "30px" }}>
//           <h3>Clinical Response</h3>
// <div
//   style={{
//     padding: "15px",
//     border: "1px solid #ddd",
//     borderRadius: "6px",
//     background: "#ffffff",
//     color: "#111111",
//     lineHeight: "1.6",
//   }}
// >
//   {answer}
// </div>

//         </div>
//       )}

//       {metadata && (
//         <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
//           <strong>Metadata</strong>
//           <pre style={{ color: "#222", background: "#f4f4f4", padding: "10px" }}>
//   {JSON.stringify(metadata, null, 2)}
// </pre>

//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


import { useState } from "react";
import PatientHeader from "./components/PatientHeader";
import ChatWindow from "./components/ChatWindow";
import QueryInput from "./components/QueryInput";

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuery = async (queryText) => {
    if (!queryText.trim()) return;

    const newMessage = {
      id: Date.now(),
      role: "doctor",
      text: queryText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/query/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });

      const data = await res.json();

const systemMessage = {
  id: Date.now() + 1,
  role: "system",
  text: data.answer,
  metadata: data.metadata,
  structured: data.structured || null,
  timestamp: new Date().toISOString(),
};
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "system",
          text: "Backend not reachable.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setLoading(false);
  };

  const clearHistory = () => {
    setMessages([]);
  };

return (
  <div className="min-h-screen bg-slate-100 flex flex-col">
    

    <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full bg-white shadow-sm border border-slate-200">

      <PatientHeader />

      <ChatWindow messages={messages} loading={loading} />

      <QueryInput onSend={sendQuery} onClear={clearHistory} loading={loading} />

    </div>

    <footer className="text-center text-xs text-slate-400 py-3">
      Deterministic-First Clinical Engine • AI-Constrained Rendering Layer
    </footer>

  </div>
);

}

export default App;
