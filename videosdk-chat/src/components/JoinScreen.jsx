import { useState } from "react";

const AUTH_TOKEN = process.env.REACT_APP_VIDEOSDK_TOKEN;


function JoinScreen({ onJoin }) {
  const [name, setName] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("create"); // "create" or "join"

  const createMeeting = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("https://api.videosdk.live/v2/rooms", {
        method: "POST",
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      return data.roomId;
    } catch (err) {
      setError("Failed to create meeting. Check your token.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!name.trim()) {
      setError("Please enter your name first");
      return;
    }
    const id = await createMeeting();
    if (id) onJoin(id, name);
  };

  const handleJoinMeeting = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!meetingId.trim()) {
      setError("Please enter a meeting ID");
      return;
    }
    onJoin(meetingId, name);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4"
      style={{
        backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 60%)`
      }}
    >
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-500/30">
            {/* Camera icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            VideoSDK <span className="text-blue-400">Meet</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Secure • Fast • Real-time video calls
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">

          {/* Tab switcher */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => { setActiveTab("create"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200
                ${activeTab === "create"
                  ? "text-blue-400 border-b-2 border-blue-400 bg-gray-900"
                  : "text-gray-500 hover:text-gray-300 bg-gray-950"
                }`}
            >
              Create Meeting
            </button>
            <button
              onClick={() => { setActiveTab("join"); setError(""); }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors duration-200
                ${activeTab === "join"
                  ? "text-purple-400 border-b-2 border-purple-400 bg-gray-900"
                  : "text-gray-500 hover:text-gray-300 bg-gray-950"
                }`}
            >
              Join Meeting
            </button>
          </div>

          <div className="p-7">

            {/* Name input - always shown */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Your Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {/* Person icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="e.g. Fardeen Khan"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl
                             border border-gray-700 focus:outline-none focus:border-blue-500
                             focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600 text-sm"
                />
              </div>
            </div>

            {/* CREATE TAB */}
            {activeTab === "create" && (
              <div>
                {/* Info box */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-5">
                  <p className="text-blue-300 text-xs leading-relaxed">
                    A new meeting room will be created instantly. Share the Meeting ID with others so they can join.
                  </p>
                </div>

                <button
                  onClick={handleCreateMeeting}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                             text-white font-semibold py-3.5 rounded-xl transition-all
                             duration-200 shadow-lg shadow-blue-600/20 disabled:opacity-50
                             disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Creating Room...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create New Meeting
                    </>
                  )}
                </button>
              </div>
            )}

            {/* JOIN TAB */}
            {activeTab === "join" && (
              <div>
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Meeting ID
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. abc-defg-hij"
                      value={meetingId}
                      onChange={(e) => { setMeetingId(e.target.value); setError(""); }}
                      className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl
                                 border border-gray-700 focus:outline-none focus:border-purple-500
                                 focus:ring-1 focus:ring-purple-500 transition placeholder-gray-600 text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleJoinMeeting}
                  className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700
                             text-white font-semibold py-3.5 rounded-xl transition-all
                             duration-200 shadow-lg shadow-purple-600/20
                             flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                  </svg>
                  Join Meeting
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-xs text-center">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Powered by{" "}
          <a href="https://videosdk.live" target="_blank" rel="noreferrer"
            className="text-blue-500 hover:text-blue-400 transition">
            VideoSDK.live
          </a>
        </p>
      </div>
    </div>
  );
}

export default JoinScreen;