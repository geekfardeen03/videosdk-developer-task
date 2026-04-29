import { useState, useEffect, useRef } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";

const AUTH_TOKEN = process.env.REACT_APP_VIDEOSDK_TOKEN;

// ─────────────────────────────────────────────
// Single participant video tile
// ─────────────────────────────────────────────
function ParticipantTile({ participantId }) {
  const videoRef = useRef(null);
  const { webcamStream, webcamOn, displayName, isLocal } =
    useParticipant(participantId);

  useEffect(() => {
    if (videoRef.current && webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((e) => console.log(e));
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video border border-gray-700">
      {webcamOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {displayName?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
        {displayName} {isLocal ? "(You)" : ""}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main meeting + chat component
// The key hook here is useMeeting's sendChatMessage
// and onChatMessage callback
// ─────────────────────────────────────────────
function ChatMeeting({ meetingId, onLeave }) {
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const {
    join,
    leave,
    toggleMic,
    toggleWebcam,
    sendChatMessage,  // ← this is the key function for chat
    localMicOn,
    localWebcamOn,
    participants,
  } = useMeeting({
    onMeetingJoined: () => setJoined(true),
    onMeetingLeft: () => onLeave(),

    // ── This callback fires every time someone sends a message ──
    // It receives the message text and sender's name automatically
    onChatMessage: ({ message, senderId, senderName, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: message,
          sender: senderName,
          senderId,
          time: new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    },

    onError: (err) => console.log("Error:", err),
  });

  // Send message handler
  const handleSend = () => {
    if (!inputText.trim()) return;
    // sendChatMessage broadcasts the message to all participants
    sendChatMessage(inputText.trim());
    setInputText("");
  };

  // Allow sending with Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-4
                      bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">💬</span>
          </div>
          <span className="text-white font-semibold text-sm">
            Chat Example
          </span>
        </div>

        <div className="flex items-center gap-2 bg-gray-800 border
                        border-gray-700 rounded-xl px-4 py-2">
          <span className="text-gray-400 text-xs">ID:</span>
          <span className="text-white text-xs font-mono">{meetingId}</span>
          <button onClick={handleCopy} className="text-gray-400 hover:text-blue-400 ml-1">
            {copied ? "✓" : "📋"}
          </button>
        </div>

        <div className="text-gray-400 text-sm">
          {[...participants.keys()].length} participant(s)
        </div>
      </div>

      {/* Main content */}
      {!joined ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <h2 className="text-white text-2xl font-bold">In-Meeting Chat Demo</h2>
          <p className="text-gray-400 text-sm text-center max-w-sm">
            Join the meeting and send real-time messages to all participants
            using VideoSDK's built-in chat feature.
          </p>
          <button
            onClick={() => join()}
            className="bg-blue-600 hover:bg-blue-500 text-white
                       font-semibold px-10 py-4 rounded-2xl transition-all"
          >
            Join Meeting
          </button>
        </div>
      ) : (
        // ── Two column layout — video on left, chat on right ──
        <div className="flex flex-1 overflow-hidden">

          {/* Left — video grid */}
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {[...participants.keys()].length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <p className="text-gray-500 text-sm">
                  Waiting for others to join...
                </p>
                <p className="text-gray-600 text-xs">
                  Share the Meeting ID from the top bar
                </p>
              </div>
            ) : (
              <div className={`grid gap-3 ${
                [...participants.keys()].length === 1
                  ? "grid-cols-1"
                  : "grid-cols-2"
              }`}>
                {[...participants.keys()].map((id) => (
                  <ParticipantTile key={id} participantId={id} />
                ))}
              </div>
            )}
          </div>

          {/* Right — chat panel */}
          <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">

            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-800">
              <h3 className="text-white font-semibold text-sm">Meeting Chat</h3>
              <p className="text-gray-500 text-xs mt-0.5">
                Messages are visible to all participants
              </p>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <span className="text-4xl">💬</span>
                  <p className="text-gray-500 text-sm text-center">
                    No messages yet. Say hi!
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-1">
                    {/* Sender name + time */}
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 text-xs font-semibold">
                        {msg.sender}
                      </span>
                      <span className="text-gray-600 text-xs">{msg.time}</span>
                    </div>
                    {/* Message bubble */}
                    <div className="bg-gray-800 text-white text-sm px-3 py-2
                                    rounded-xl rounded-tl-none max-w-full break-words">
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {/* Auto scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-3 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-gray-800 text-white text-sm px-3 py-2.5
                             rounded-xl border border-gray-700 focus:outline-none
                             focus:border-blue-500 placeholder-gray-600"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40
                             text-white px-3 py-2.5 rounded-xl transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-xs mt-1.5 text-center">
                Press Enter to send
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control bar */}
      {joined && (
        <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleMic}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl
                          transition-all ${localMicOn
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"}`}
            >
              <span className="text-lg">{localMicOn ? "🎙️" : "🔇"}</span>
              <span className="text-xs">{localMicOn ? "Mute" : "Unmute"}</span>
            </button>

            <button
              onClick={toggleWebcam}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl
                          transition-all ${localWebcamOn
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"}`}
            >
              <span className="text-lg">{localWebcamOn ? "📹" : "📷"}</span>
              <span className="text-xs">{localWebcamOn ? "Stop Cam" : "Start Cam"}</span>
            </button>

            <button
              onClick={leave}
              className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl
                         bg-red-700 hover:bg-red-600 text-white transition-all"
            >
              <span className="text-lg">📵</span>
              <span className="text-xs">Leave</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Wrapper with MeetingProvider
// ─────────────────────────────────────────────
function ChatExample({ meetingId, name, onLeave }) {
  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name,
      }}
      token={AUTH_TOKEN}
    >
      <MeetingConsumer>
        {() => <ChatMeeting meetingId={meetingId} onLeave={onLeave} />}
      </MeetingConsumer>
    </MeetingProvider>
  );
}

export default ChatExample;