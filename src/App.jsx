import { useState } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";

const sendToAI = async (businessInfo, customerMessage) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
},
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are a friendly customer support assistant for a small business. 
Here is the business information:
${businessInfo}

Your job is to reply to customer messages on behalf of this business.
Generate exactly 3 short reply options (1-2 sentences each).
Respond ONLY in this JSON format, no markdown, no extra text:
{"replies": ["reply1", "reply2", "reply3"]}
Keep replies warm, professional, and helpful. Match the language the customer uses (Telugu/Hindi/English).`,
      messages: [{ role: "user", content: `Customer message: "${customerMessage}"` }],
    }),
  });
  const data = await response.json();
  const text = data.content?.find(b => b.type === "text")?.text || "{}";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
};

export default function App() {
  const [step, setStep] = useState("setup"); // setup | chat
  const [businessInfo, setBusinessInfo] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [customerMsg, setCustomerMsg] = useState("");
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSetup = () => {
    if (!businessName.trim() || !businessInfo.trim()) return;
    setStep("chat");
  };

  const handleGenerate = async () => {
    if (!customerMsg.trim()) return;
    setLoading(true);
    setReplies([]);
    try {
      const result = await sendToAI(
        `Business Name: ${businessName}\n${businessInfo}`,
        customerMsg
      );
      setReplies(result.replies || []);
      setChatHistory(prev => [...prev, { customer: customerMsg, replies: result.replies || [] }]);
      setCustomerMsg("");
    } catch (e) {
      setReplies(["Error generating replies. Please try again."]);
    }
    setLoading(false);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#f1f5f9",
      padding: "24px 16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          background: "linear-gradient(90deg, #22d3ee22, #818cf822)",
          border: "1px solid #22d3ee33",
          borderRadius: "100px", padding: "6px 16px", marginBottom: "16px",
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22d3ee", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 12, color: "#22d3ee", fontWeight: 600, letterSpacing: 1 }}>AI REPLY ASSISTANT</span>
        </div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 6vw, 42px)",
          fontWeight: 800, margin: 0, lineHeight: 1.1,
          background: "linear-gradient(90deg, #f1f5f9, #22d3ee)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          ReplyBot
        </h1>
        <p style={{ color: "#64748b", marginTop: 8, fontSize: 14 }}>
          AI replies for your business — in seconds
        </p>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {step === "setup" ? (
          /* SETUP SCREEN */
          <div style={{
            background: "#ffffff08",
            border: "1px solid #ffffff14",
            borderRadius: 20, padding: "28px 24px",
            backdropFilter: "blur(10px)",
          }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>
              Setup Your Business
            </h2>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>
              Enter your business details once. The AI will use this to reply to customers.
            </p>

            <label style={labelStyle}>Business Name</label>
            <input
              style={inputStyle}
              placeholder="e.g. Sri Lakshmi Boutique"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
            />

            <label style={{ ...labelStyle, marginTop: 16 }}>Business Details</label>
            <textarea
              style={{ ...inputStyle, height: 130, resize: "none" }}
              placeholder={`Describe your business:\n• What you sell / services\n• Timings\n• Location\n• Prices (optional)\n• Language preference`}
              value={businessInfo}
              onChange={e => setBusinessInfo(e.target.value)}
            />

            <div style={{
              background: "#22d3ee11", border: "1px solid #22d3ee22",
              borderRadius: 12, padding: "12px 16px", margin: "16px 0",
              fontSize: 12, color: "#94a3b8", lineHeight: 1.6,
            }}>
              💡 <strong style={{ color: "#22d3ee" }}>Example:</strong> "We sell handmade sarees and dress materials. Shop open 10am–8pm. Located in Rajahmundry. WhatsApp orders accepted. Prices start from ₹800."
            </div>

            <button
              onClick={handleSetup}
              disabled={!businessName.trim() || !businessInfo.trim()}
              style={btnStyle(!businessName.trim() || !businessInfo.trim())}
            >
              Start Replying →
            </button>
          </div>

        ) : (
          /* CHAT SCREEN */
          <>
            {/* Business badge */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#ffffff08", border: "1px solid #ffffff14",
              borderRadius: 14, padding: "12px 16px", marginBottom: 16,
            }}>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>ACTIVE BUSINESS</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{businessName}</div>
              </div>
              <button onClick={() => { setStep("setup"); setReplies([]); setChatHistory([]); }}
                style={{ background: "none", border: "1px solid #ffffff22", borderRadius: 8, color: "#64748b", padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                Edit
              </button>
            </div>

            {/* Previous chats */}
            {chatHistory.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {chatHistory.slice(-2).map((item, i) => (
                  <div key={i} style={{
                    background: "#ffffff06", border: "1px solid #ffffff0e",
                    borderRadius: 14, padding: "14px 16px", marginBottom: 10,
                    opacity: 0.6,
                  }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>CUSTOMER ASKED</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>"{item.customer}"</div>
                  </div>
                ))}
              </div>
            )}

            {/* Input area */}
            <div style={{
              background: "#ffffff08", border: "1px solid #ffffff14",
              borderRadius: 20, padding: "20px",
            }}>
              <label style={labelStyle}>Customer's Message</label>
              <textarea
                style={{ ...inputStyle, height: 90, resize: "none" }}
                placeholder='e.g. "Hi, do you have silk sarees? What is the price?"'
                value={customerMsg}
                onChange={e => setCustomerMsg(e.target.value)}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !customerMsg.trim()}
                style={btnStyle(loading || !customerMsg.trim())}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ width: 14, height: 14, border: "2px solid #ffffff44", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    Generating...
                  </span>
                ) : "✨ Generate Replies"}
              </button>
            </div>

            {/* Reply suggestions */}
            {replies.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, letterSpacing: 1 }}>
                  TAP TO COPY A REPLY
                </div>
                {replies.map((reply, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopy(reply, idx)}
                    style={{
                      background: copied === idx ? "#22d3ee18" : "#ffffff08",
                      border: `1px solid ${copied === idx ? "#22d3ee55" : "#ffffff14"}`,
                      borderRadius: 14, padding: "14px 16px",
                      marginBottom: 10, cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
                    }}
                  >
                    <div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: "#22d3ee",
                        background: "#22d3ee18", padding: "2px 8px", borderRadius: 100,
                        marginBottom: 8, display: "inline-block",
                      }}>
                        OPTION {idx + 1}
                      </span>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#e2e8f0" }}>{reply}</p>
                    </div>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 4 }}>
                      {copied === idx ? "✅" : "📋"}
                    </span>
                  </div>
                ))}
                <p style={{ textAlign: "center", fontSize: 12, color: "#475569", marginTop: 8 }}>
                  Copy any reply → paste it on Instagram / WhatsApp
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        input::placeholder, textarea::placeholder { color: #374151; }
        input:focus, textarea:focus { outline: none; border-color: #22d3ee55 !important; background: #ffffff10 !important; }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 600,
  color: "#64748b", letterSpacing: 1, marginBottom: 8,
};

const inputStyle = {
  width: "100%", background: "#ffffff08",
  border: "1px solid #ffffff14", borderRadius: 12,
  padding: "12px 14px", color: "#f1f5f9", fontSize: 14,
  boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif",
  transition: "all 0.2s",
};

const btnStyle = (disabled) => ({
  width: "100%", padding: "14px",
  background: disabled ? "#ffffff08" : "linear-gradient(90deg, #22d3ee, #818cf8)",
  border: "none", borderRadius: 12,
  color: disabled ? "#374151" : "#000",
  fontWeight: 700, fontSize: 15,
  cursor: disabled ? "not-allowed" : "pointer",
  marginTop: 16, transition: "all 0.2s",
  fontFamily: "'DM Sans', sans-serif",
});
