# VideoSDK 

**Submitted by:** Fardeen NS Khan
**College:** B.Tech CSE, SVNIT Surat
**GitHub:** github.com/geekfardeen03

---

## What is in this repository

This repository contains everything I built for the VideoSDK Developer Advocate task:

1. A full video calling web app built with VideoSDK's React SDK
2. A screen sharing example
3. An in-meeting chat example
4. A blog post about the build process
5. A video tutorial walkthrough

---

## Folder structure

```
videosdk-developer-task/
│
├── videosdk-chat/              ← Main app — full video calling app
│
├── videosdk-examples/
│   ├── screen-share-example/   ← Example 1 — screen sharing feature
│   └── chat-example/           ← Example 2 — in-meeting chat feature
│
├── blog-post.md                ← Written blog post (also published on Hashnode)
│
└── README.md                   ← This file
```

---

## How to run each project

Every project follows the same three steps.

**Step 1 — Go into the folder**
```
cd videosdk-chat
```

**Step 2 — Install dependencies**
```
npm install
```

**Step 3 — Create a .env file in that folder**
```
REACT_APP_VIDEOSDK_TOKEN=your_token_here
```
Get your token from app.videosdk.live after logging in. Go to API Keys on the left sidebar and copy the Auth Token.

**Step 4 — Start the app**
```
npm start
```

The app opens at localhost:3000.

Do the same steps for screen-share-example and chat-example. Each one is its own separate React project.

---

## What each project does

### videosdk-chat — Main App

This is a 1-on-1 video calling app. A user enters their name and either creates a new meeting room or joins an existing one using a meeting ID.

Once inside the meeting:
- Both participants' videos appear in real time
- Either participant can toggle their microphone on or off
- Either participant can toggle their camera on or off
- The meeting ID is shown at the top so you can share it with someone
- Either participant can leave at any time

To test it yourself: open the app in two browser tabs, enter different names, copy the meeting ID from the first tab and paste it into the second tab. Both tabs will be in the same live meeting.

**Tech used:** React, VideoSDK React SDK, Tailwind CSS, VideoSDK Rooms API

---

### screen-share-example — Example 1

This example shows how to add screen sharing to a VideoSDK meeting.

When you click Share Screen inside a meeting, the browser opens its native screen picker. You choose which window or tab to share. That stream is then broadcast to every other participant in real time as a separate video track alongside your webcam.

Stopping the share is one click.

The key thing this example demonstrates is that screen sharing in VideoSDK is a single function call — toggleScreenShare() from the useMeeting hook. The SDK handles everything underneath.

**Tech used:** React, VideoSDK React SDK, Tailwind CSS

---

### chat-example — Example 2

This example shows how to add real-time text chat to a VideoSDK meeting.

While in a meeting, participants can type messages and send them. Every message appears instantly for all participants in the meeting. Messages show the sender's name and timestamp. You can press Enter to send.

There is no external chat service involved. VideoSDK has chat built in. You call sendChatMessage() to send, and the onChatMessage callback fires on every connected client when a message arrives.

**Tech used:** React, VideoSDK React SDK, Tailwind CSS

---

## Blog post

The blog post covers:
- Why I picked VideoSDK over other options
- How the app architecture works
- The two bugs I hit during development and what actually caused them
- How screen sharing and chat work under the hood
- What I would change if this were a production app

Published on Hashnode: [link]

Also included as blog-post.md in this repository.

---

## Video tutorial

The video tutorial is approximately 10 minutes long and covers:
- Live demo of the app with two participants
- Code walkthrough of the three main components
- Explanation of why useRef is used for media streams instead of useState
- The two bugs I hit and how I debugged them
- Quick walkthrough of the screen sharing and chat examples

Google Drive: [link]

---

## Important note about the auth token

The .env file is not committed to this repository. This is intentional.

The token in .env is a short-lived JWT issued by VideoSDK's dashboard. Committing it would expose it publicly, and it expires within a few days anyway.

To run any of these projects you need your own token from app.videosdk.live. It is free. Signup takes two minutes.

In a production app the token would be generated server-side using the API key and secret, so the secret never touches the frontend. For this development build a dashboard token works fine.

---

## That said 


Developer advocacy is exactly that job. You understand the SDK deeply enough to know what's hard about it, and you explain it clearly enough that other developers don't hit the same walls you did.

I built this entire submission in a few days, hit real bugs, debugged them properly, and wrote about them honestly. That is what I would do in this role every day.



---

*Fardeen NS Khan — geekfardeen03 on GitHub*
