import { useState } from "react";
import JoinScreen from "./components/JoinScreen";
import MeetingView from "./components/MeetingView";

function App() {
  const [meetingId, setMeetingId] = useState(null);
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = (id, userName) => {
    setMeetingId(id);
    setName(userName);
    setJoined(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!joined ? (
        <JoinScreen onJoin={handleJoin} />
      ) : (
        <MeetingView
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