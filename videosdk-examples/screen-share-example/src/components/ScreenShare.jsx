import { useState, useEffect, useRef } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";

const AUTH_TOKEN = process.env.REACT_APP_VIDEOSDK_TOKEN;

// ─────────────────────────────────────────────
// This component shows one participant's
// screen share stream or their video
// ─────────────────────────────────────────────
function ParticipantScreen({ participantId }) {
  const videoRef = useRef(null);
  const screenRef = useRef(null);

  const {
    webcamStream,
    screenShareStream,
    webcamOn,
    screenShareOn,
    displayName,
    isLocal,
  } = useParticipant(participantId);

  // Attach webcam stream to video element
  useEffect(() => {
    if (videoRef.current && webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch((e) => console.log(e));
    }
  }, [webcamStream, webcamOn]);

  // Attach screen share stream to screen element
  useEffect(() => {
    if (screenRef.current && screenShareOn && screenShareStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareStream.track);
      screenRef.current.srcObject = mediaStream;
      screenRef.current.play().catch((e) => console.log(e));
    }
  }, [screenShareStream, screenShareOn]);

  return (
    <div className="flex flex-col gap-3">
      {/* Screen share view - shows big when active */}
      {screenShareOn && (
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden border border-blue-500/40">
          <div className="absolute top-3 left-3 z-10 bg-blue-600 text-white 
                          text-xs font-semibold px-3 py-1 rounded-full">
            🖥️ {displayName} is sharing screen
          </div>
          <video
            ref={screenRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full rounded-2xl"
          />
        </div>
      )}

      {/* Webcam tile - small */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video
                      border border-gray-700">
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

        {/* Name tag */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white 
                        text-xs px-2 py-1 rounded-lg">
          {displayName} {isLocal ? "(You)" : ""}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main meeting controls with screen share button
// The key hook here is toggleScreenShare()
// from useMeeting
// ─────────────────────────────────────────────
function ScreenShareMeeting({ meetingId, onLeave }) {
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    join,
    leave,
    toggleMic,
    toggleWebcam,
    toggleScreenShare,
    localMicOn,
    localWebcamOn,
    localScreenShareOn,
    participants,
  } = useMeeting({
    onMeetingJoined: () => setJoined(true),
    onMeetingLeft: () => onLeave(),
    onError: (err) => console.log("Error:", err),
  });

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
            <span className="text-white text-sm">🖥️</span>
          </div>
          <span className="text-white font-semibold text-sm">
            Screen Share Example
          </span>
        </div>

        {/* Meeting ID */}
        <div className="flex items-center gap-2 bg-gray-800 border 
                        border-gray-700 rounded-xl px-4 py-2">
          <span className="text-gray-400 text-xs">ID:</span>
          <span className="text-white text-xs font-mono">{meetingId}</span>
          <button onClick={handleCopy} className="text-gray-400 hover:text-blue-400">
            {copied ? "✓" : "📋"}
          </button>
        </div>

        <div className="text-gray-400 text-sm">
          {[...participants.keys()].length} participant(s)
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 p-6">
        {!joined ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <h2 className="text-white text-2xl font-bold">
              Screen Share Demo
            </h2>
            <p className="text-gray-400 text-sm text-center max-w-sm">
              Join the meeting, then click the Share Screen button 
              to broadcast your screen to all participants in real time.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...participants.keys()].map((id) => (
              <ParticipantScreen key={id} participantId={id} />
            ))}
          </div>
        )}
      </div>

      {/* Control bar */}
      {joined && (
        <div className="bg-gray-900 border-t border-gray-800 px-6 py-5">
          <div className="flex items-center justify-center gap-4">

            {/* Mic */}
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

            {/* Camera */}
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

            {/* ── SCREEN SHARE BUTTON ── */}
            {/* This is the main feature of this example */}
            {/* toggleScreenShare() starts/stops screen capture */}
            <button
              onClick={toggleScreenShare}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl
                          transition-all ${localScreenShareOn
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-white"}`}
            >
              <span className="text-lg">🖥️</span>
              <span className="text-xs">
                {localScreenShareOn ? "Stop Share" : "Share Screen"}
              </span>
            </button>

            {/* Leave */}
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
function ScreenShareExample({ meetingId, name, onLeave }) {
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
        {() => (
          <ScreenShareMeeting meetingId={meetingId} onLeave={onLeave} />
        )}
      </MeetingConsumer>
    </MeetingProvider>
  );
}

export default ScreenShareExample;