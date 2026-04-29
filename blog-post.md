# I Tried to Build a Video Calling App in an Afternoon. It Took Longer. Here's Everything.

**By Fardeen NS Khan | B.Tech CSE, SVNIT Surat | April 27, 2026**

---

Let me set the scene.

It's a Sunday. I have chai, I have VS Code open, and I have the completely reasonable belief that I'll build a working video calling app before dinner. I'd used React before. I'd hit APIs before. How complicated could real-time video actually be?

Reader, I did not finish before dinner.

But I did finish — and what I built genuinely surprised me. Not because it was complex, but because it wasn't. That's the VideoSDK story, and I'll get to it. First, let me tell you about the part where I broke everything.

---

## Why I Picked VideoSDK

When I started researching options, the usual names came up — Twilio, Agora, Daily. I poked around all of them. Some had docs that felt like they were written by someone who genuinely hates developers. Nested sidebars. Deprecated examples. "Refer to the legacy guide for context." No thank you.

VideoSDK was different. Their docs are clean, their React SDK has actual hooks — `useMeeting`, `useParticipant` — which means it fits into a React project like it was always supposed to be there. No XML config files, no verbose SDK initialization rituals, no Java-flavored API design awkwardly ported to JavaScript.

Also their free tier doesn't ask for a credit card. I'm a third-year student. This matters more than I'd like to admit.

---

## What I Was Building

A 1-on-1 video chat app. Join a meeting, see each other's video, toggle mic and camera, leave. Clean UI with Tailwind. Three components:

- **JoinScreen** — enter your name, create a new room or join an existing one with a meeting ID
- **MeetingView** — the actual call, built around VideoSDK's `MeetingProvider`
- **ParticipantView** — one video tile per participant, handles their stream

The plan was clean. The execution had opinions.

---

## The Part Where It Went Wrong (Technically)

Everything was wired up. Token in `.env`, components connected, `npm start` running. I typed my name, hit Create Meeting, and —

Nothing.

No error on screen. No loading state. Just silence. I opened DevTools like a detective who already knows they're not going to like what they find, and there it was:

```
POST https://api.videosdk.live/v2/rooms 401 (Unauthorized)
```

My first instinct was that I'd written the API call wrong. Wrong header, wrong endpoint, something. I checked the docs three times. Everything matched. Then I actually read the token I'd pasted into `.env` and decoded the JWT payload — and found `"exp": 1777990849`. The token had expired. VideoSDK's development tokens are short-lived signed JWTs. Once the expiry timestamp passes, every request returns 401 regardless of how correct the rest of your code is.

Fresh token from the dashboard, restart the dev server, back in business. Felt a bit silly. Moving on.

The second issue was less silly and more legitimately annoying. After the token was sorted, I hit this:

```
TypeError: Cannot read properties of null (reading 'useRef')
    at MeetingProvider
```

This one took real debugging. The root cause was a duplicate React instance in the dependency tree — `@videosdk.live/react-sdk` was pulling its own internal copy of React, which conflicted with the React version my project was using. React's hook system fundamentally breaks when two copies exist in the same app. Hooks depend on a single shared React object to maintain state across renders. Two React copies means two separate hook registries, and they don't talk to each other — hence the null reference when `MeetingProvider` tried to call `useRef` through the wrong one.

The fix was forcing npm to resolve a single React version across the entire dependency tree using the `overrides` field in `package.json`:

```json
"overrides": {
  "react": "18.2.0",
  "react-dom": "18.2.0"
}
```

Deleted `node_modules`, fresh `npm install`, and the error was gone. This is the kind of thing that doesn't appear in any tutorial because tutorials assume a clean environment. Real projects are not clean environments.

---

## How the App Actually Works

Once it was running, the architecture is genuinely elegant — and most of that credit goes to how VideoSDK designed their SDK.

Creating a meeting room is one API call:

```js
const response = await fetch("https://api.videosdk.live/v2/rooms", {
  method: "POST",
  headers: {
    Authorization: AUTH_TOKEN,
    "Content-Type": "application/json",
  },
});
const data = await response.json();
// data.roomId — this is your meeting ID, share it with anyone
```

That `roomId` goes into `MeetingProvider`, which wraps your entire meeting UI and acts like a React context. Every component inside it can access meeting state through hooks. No prop drilling, no global store setup, no Redux middleware. Just hooks.

```jsx
<MeetingProvider
  config={{ meetingId, micEnabled: true, webcamEnabled: true, name }}
  token={AUTH_TOKEN}
>
  <YourMeetingUI />
</MeetingProvider>
```

Inside `MeetingView`, the `useMeeting` hook gives you everything — `join`, `leave`, `toggleMic`, `toggleWebcam`, the list of participants, local mic/camera state. The whole control surface of the meeting in one hook call.

The trickiest part of the whole app was actually attaching the video stream in `ParticipantView`. You can't use React state for this:

```js
useEffect(() => {
  if (webcamOn && webcamStream) {
    const mediaStream = new MediaStream();
    mediaStream.addTrack(webcamStream.track);
    videoRef.current.srcObject = mediaStream;
    videoRef.current.play();
  }
}, [webcamStream, webcamOn]);
```

The `useRef` is intentional. Setting state triggers a re-render. Re-rendering while a media stream is attached to a video element interrupts playback. The ref gives you direct DOM access without touching the render cycle. This is one of those React decisions that feels weird until it suddenly makes complete sense.

---

## The Moment It Actually Worked

I had two browser tabs open — different names, same meeting ID. When I joined from the second tab and both video tiles appeared simultaneously, both live, both reacting to mic toggles in real time — I genuinely sat back for a second.

It wasn't just that it worked. It was that I understood exactly why it worked. Every line of that code made sense to me. That feeling is worth the two hours of debugging that preceded it.

---

## Two More Examples — Screen Sharing and Chat

Alongside the main app I built two focused examples to demonstrate specific SDK features.

**Screen sharing** turned out to be embarrassingly simple. One function: `toggleScreenShare()` from `useMeeting`. The browser opens its native screen picker, the user selects a window or tab, and VideoSDK streams it to all participants as a separate WebRTC track. Displaying it is identical to the webcam pattern — a `useRef` on a video element, stream attached in a `useEffect`. The SDK handles the rest.

**In-meeting chat** uses `sendChatMessage(text)` to broadcast to all participants, and the `onChatMessage` callback fires on every connected client when a message arrives — with sender name, message content, and timestamp. No socket.io. No websocket setup. No external service. It's built into the SDK. I built the entire chat panel — message bubbles, timestamps, auto-scroll, Enter to send — in an afternoon. Which is ironic because that's what I thought the whole app would take.

---

## What VideoSDK Actually Gets Right

I want to be specific here because vague praise is useless.

The WebRTC layer is genuinely invisible. I never wrote an SDP offer. I never configured a STUN or TURN server. I never thought about ICE candidates. For a developer building a product that needs video, this is the entire value proposition — the hard, infrastructure-level problem is solved, and what's left is product work.

The React SDK feels like it was designed by people who actually use React. Hooks that map cleanly to mental models, a Provider pattern that fits naturally into component trees, callbacks that match how React developers already think about events. It doesn't feel bolted on.

And the docs — genuinely good docs are rarer than they should be. VideoSDK's are clear, example-heavy, and current. That last one sounds obvious but it's not.

---

## What I'd Change for Production

Two things I deliberately kept simple that would need revisiting in a real product:

The auth token is in a `.env` file on the frontend. Fine for development, not fine for production. The right approach is a backend endpoint that generates a fresh signed JWT using your API key and secret — the frontend requests it at runtime, the secret never touches the client.

I also didn't implement reconnection handling. If a participant drops mid-call and rejoins, the stream reference needs to be reattached. VideoSDK exposes callbacks for participant state changes that would handle this — I kept scope tight for this build.

---

## Final Thought

I started this thinking WebRTC was the hard part. Turns out WebRTC is VideoSDK's problem. The actual work was React component architecture, state management, understanding how media streams attach to the DOM, and — as always — debugging things that tutorials don't warn you about.

If you know React hooks, you can build something working with VideoSDK in a day. If you spend two hours on dependency conflicts first, you can still build something working with VideoSDK in a day.

Both versions of that sentence are true for me.

Full source code: [github.com/geekfardeen03](https://github.com/geekfardeen03)

---

*Fardeen , someone who builds things, breaks things, figures out why they broke, and occasionally writes about it.*
