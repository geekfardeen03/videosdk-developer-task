import { useEffect, useRef } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";

// This component renders ONE participant's video tile
// It receives the participantId and uses the useParticipant
// hook to get their video/audio streams
function ParticipantView({ participantId }) {
  const videoRef = useRef(null);

  const {
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
  } = useParticipant(participantId);

  // This effect runs whenever the webcam stream changes
  // It attaches the video stream to the video HTML element
  useEffect(() => {
    if (videoRef.current) {
      if (webcamOn && webcamStream) {
        // Create a MediaStream from the webcam track
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) =>
          console.log("Video play error:", err)
        );
      } else {
        // If webcam is off, clear the video
        videoRef.current.srcObject = null;
      }
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video
                    border border-gray-800 shadow-xl">

      {/* Video element */}
      {webcamOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // mute local to avoid echo
          className="w-full h-full object-cover"
        />
      ) : (
        // Avatar when camera is off
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-3">
            <span className="text-3xl font-bold text-white">
              {displayName ? displayName.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Camera Off</p>
        </div>
      )}

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2
                      bg-gradient-to-t from-black/80 to-transparent
                      flex items-center justify-between">

        {/* Name tag */}
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">
            {displayName} {isLocal ? "(You)" : ""}
          </span>
        </div>

        {/* Mic status indicator */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center
                        ${micOn ? "bg-gray-700" : "bg-red-600"}`}>
          {micOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </div>
      </div>

      {/* Local badge */}
      {isLocal && (
        <div className="absolute top-3 right-3 bg-blue-600 text-white
                        text-xs font-semibold px-2 py-1 rounded-lg">
          You
        </div>
      )}
    </div>
  );
}

export default ParticipantView;