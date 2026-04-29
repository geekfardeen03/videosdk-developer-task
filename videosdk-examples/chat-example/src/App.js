import { useState } from "react";
import ChatExample from "./components/ChatExample";

const AUTH_TOKEN = process.env.REACT_APP_VIDEOSDK_TOKEN;

function App() {
  const [meetingId, setMeetingId] = useState(null);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createMeeting = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.videosdk.live/v2/rooms", {
        method: "POST",
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!data.roomId) throw new Error("No room ID returned");
      return data.roomId;
    } catch (e) {
      setError("Failed to create meeting. Check your token.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    const id = await createMeeting();
    if (id) {
      setMeetingId(id);
      setJoined(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!joined ? (
        <div className="flex items-center justify-center min-h-screen px-4"
          style={{
            backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%),
                              radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 60%)`
          }}
        >
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">

            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-14 h-14
                              rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-500/30">
                <span className="text-2xl">💬</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Chat Example</h1>
              <p className="text-gray-500 text-sm mt-1">
                In-meeting real-time chat using VideoSDK
              </p>
            </div>

            {/* Name input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-400
                                uppercase tracking-wider mb-2">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Fardeen Khan"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl
                           border border-gray-700 focus:outline-none
                           focus:border-blue-500 transition placeholder-gray-600 text-sm"
              />
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white
                         font-semibold py-3.5 rounded-xl transition-all
                         shadow-lg shadow-blue-600/20 disabled:opacity-50
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating room...
                </>
              ) : (
                "Start Chat Demo"
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-xs text-center">{error}</p>
              </div>
            )}

            {/* Info box */}
            <div className="mt-5 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-blue-300 text-xs leading-relaxed text-center">
                Open this in two tabs and send messages — they appear in real time on both sides.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <ChatExample
          meetingId={meetingId}
          name={name}
          onLeave={() => {
            setJoined(false);
            setMeetingId(null);
          }}
        />
      )}
    </div>
  );
}

export default App;