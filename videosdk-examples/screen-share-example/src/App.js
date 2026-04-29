import { useState } from "react";
import ScreenShareExample from "./components/ScreenShare";

const AUTH_TOKEN = process.env.REACT_APP_VIDEOSDK_TOKEN;

function App() {
  const [meetingId, setMeetingId] = useState(null);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const createMeeting = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.videosdk.live/v2/rooms", {
        method: "POST",
        headers: {
          Authorization: AUTH_TOKEN,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      return data.roomId;
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!name.trim()) return alert("Enter your name");
    const id = await createMeeting();
    if (id) {
      setMeetingId(id);
      setJoined(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!joined ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
            <h1 className="text-2xl font-bold text-center mb-2">
              🖥️ Screen Share
            </h1>
            <p className="text-gray-400 text-sm text-center mb-6">
              VideoSDK Example — Screen Sharing Feature
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl 
                         border border-gray-700 focus:outline-none focus:border-blue-500 mb-4"
            />
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white 
                         font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Creating room..." : "Start Screen Share Demo"}
            </button>
          </div>
        </div>
      ) : (
        <ScreenShareExample
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