# VideoSDK In-Meeting Chat Example

This example demonstrates real-time chat inside a video meeting
using the VideoSDK React SDK.

## What it does

- Join a meeting room with video and audio
- Send text messages to all participants in real time
- Messages appear instantly on all connected clients
- Chat panel sits alongside the video grid

## How chat works in VideoSDK

VideoSDK has built-in chat via two things:

1. `sendChatMessage(text)` — call this to send a message to everyone
2. `onChatMessage` callback in `useMeeting` — fires on every client
   when anyone sends a message, giving you sender name, message, timestamp

No external library needed — it's all built into the SDK.

## Setup

1. Clone this repo
2. Run `npm install`
3. Create a `.env` file:
   REACT_APP_VIDEOSDK_TOKEN=your_token_here
4. Run `npm start`
5. Open in two browser tabs to test chat

## Key code explained

sendChatMessage("Hello!")
// sends to ALL participants in the meeting

onChatMessage: ({ senderName, message, timestamp }) => {
// this fires on every client when a message is received
}
