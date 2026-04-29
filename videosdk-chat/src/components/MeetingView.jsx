import { useState } from "react";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  MeetingConsumer,
} from "@videosdk.live/react-sdk";
import ParticipantView from "./ParticipantView";

const AUTH_TOKEN = process.env.REACT_APP_VIDEOSDK_TOKEN;

// ─────────────────────────────────────────────
// This is the inner component that has access
// to all meeting controls via the useMeeting hook
// ─────────────────────────────────────────────
function MeetingControls({ meetingId, onLeave }) {
  const {
    join,
    leave,
    toggleMic,
    toggleWebcam,
    participants,
    localMicOn,
    localWebcamOn,
  } = useMeeting({
    onMeetingJoined: () => {
      console.log("Meeting joined successfully!");
    },
    onMeetingLeft: () => {
      onLeave();
    },
    onError: (error) => {
      console.log("Meeting error:", error);
    },
  });

  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  // Join the meeting when component mounts
  const handleJoin = () => {
    join();
    setJoined(true);
  };

  // Copy meeting ID to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ── Top navbar ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        {/* Left - brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">VideoSDK Meet</span>
        </div>

        {/* Center - meeting ID */}
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2">
          <span className="text-gray-400 text-xs">Meeting ID:</span>
          <span className="text-white text-xs font-mono font-semibold">{meetingId}</span>
          <button
            onClick={handleCopy}
            className="ml-1 text-gray-400 hover:text-blue-400 transition"
            title="Copy Meeting ID"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Right - participant count */}
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{[...participants.keys()].length} participant{[...participants.keys()].length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 p-6">
        {!joined ? (
          // Show join button if not joined yet
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <h2 className="text-white text-2xl font-bold mb-2">Ready to join?</h2>
              <p className="text-gray-400 text-sm">Meeting ID: <span className="text-blue-400 font-mono">{meetingId}</span></p>
            </div>
            <button
              onClick={handleJoin}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold
                         px-10 py-4 rounded-2xl transition-all duration-200
                         shadow-lg shadow-blue-600/30 text-lg"
            >
              Join Now
            </button>
          </div>
        ) : (
          // Show participant grid when joined
          <div>
            {[...participants.keys()].length === 0 ? (
              // Empty state - waiting for others
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Waiting for others to join...</p>
                <p className="text-gray-600 text-xs">Share the Meeting ID from the top bar</p>
              </div>
            ) : (
              // Participant grid
              <div className={`grid gap-4 ${
                [...participants.keys()].length === 1
                  ? "grid-cols-1 max-w-2xl mx-auto"
                  : [...participants.keys()].length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2 lg:grid-cols-3"
              }`}>
                {[...participants.keys()].map((participantId) => (
                  <ParticipantView
                    key={participantId}
                    participantId={participantId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom control bar ── */}
      {joined && (
        <div className="bg-gray-900 border-t border-gray-800 px-6 py-5">
          <div className="flex items-center justify-center gap-4">

            {/* Mic toggle */}
            <button
              onClick={toggleMic}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl
                          transition-all duration-200 ${
                localMicOn
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-red-600 hover:bg-red-500 text-white"
              }`}
            >
              {localMicOn ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
              <span className="text-xs font-medium">{localMicOn ? "Mute" : "Unmute"}</span>
            </button>

            {/* Camera toggle */}
            <button
              onClick={toggleWebcam}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-2xl
                          transition-all duration-200 ${
                localWebcamOn
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-red-600 hover:bg-red-500 text-white"
              }`}
            >
              {localWebcamOn ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
              <span className="text-xs font-medium">{localWebcamOn ? "Stop Video" : "Start Video"}</span>
            </button>

            {/* Leave button */}
            <button
              onClick={leave}
              className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl
                         bg-red-700 hover:bg-red-600 text-white transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs font-medium">Leave</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// This is the outer wrapper component
// MeetingProvider wraps everything and gives
// the meeting context to all child components
// ─────────────────────────────────────────────
function MeetingView({ meetingId, name, onLeave }) {
  return (
    <MeetingProvider
      config={{
        meetingId: meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: name,
      }}
      token={AUTH_TOKEN}
    >
      <MeetingConsumer>
        {() => (
          <MeetingControls
            meetingId={meetingId}
            onLeave={onLeave}
          />
        )}
      </MeetingConsumer>
    </MeetingProvider>
  );
}

export default MeetingView;