import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import socket from "./socket"; // using the shared socket
import "bootstrap/dist/css/bootstrap.min.css";

// Simple helper to check if a URL is likely a video
// (works if the URL ends in .mp4, .mov, .webm, etc.)
function isVideoFile(url = "") {
  return /\.(mp4|mov|avi|webm)$/i.test(url);
}

function ChatMain() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, roomCode } = location.state || {};

  useEffect(() => {
    if (!username || !roomCode) {
      navigate("/"); // Redirect if the username or roomCode is not provided
    }
  }, [username, roomCode, navigate]);

  const [generatedRoom] = useState(roomCode || "");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);

  // A ref to store the current MediaRecorder
  const audioRecorder = useRef(null);

  // A hidden file input ref
  const fileInputRef = useRef(null);

  // We'll use this ref to keep track of WaveSurfer instances for each audio message in chat
  const waveSurferRefs = useRef([]);

  // For the local preview of the just-recorded audio
  const localWaveformRef = useRef(null);
  const localWaveSurferRef = useRef(null);

  // Listen for incoming messages from the server
  useEffect(() => {
    const messageHandler = (msg) => {
      console.log("New message received:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on("receiveMessage", messageHandler);

    return () => {
      socket.off("receiveMessage", messageHandler);
    };
  }, []);

  // Whenever we have new messages, create WaveSurfer for any new audio message
  useEffect(() => {
    messages.forEach((msg, index) => {
      if (msg.audio && !waveSurferRefs.current[index]) {
        const waveSurfer = WaveSurfer.create({
          container: `#waveform-${index}`,
          waveColor: "#333",
          progressColor: "#e6e6e6",
          barWidth: 2,
          barHeight: 1,
          height: 50,
          cursorWidth: 1,
        });
        waveSurfer.load(msg.audio);
        waveSurferRefs.current[index] = waveSurfer;
      }
    });
  }, [messages]);

  // Whenever recordedAudio changes, create or destroy the local preview WaveSurfer
  useEffect(() => {
    if (recordedAudio) {
      if (localWaveSurferRef.current) {
        localWaveSurferRef.current.destroy();
      }
      const waveSurfer = WaveSurfer.create({
        container: localWaveformRef.current,
        waveColor: "#333",
        progressColor: "#e6e6e6",
        barWidth: 2,
        barHeight: 1,
        height: 50,
        cursorWidth: 1,
      });
      waveSurfer.loadBlob(recordedAudio);
      localWaveSurferRef.current = waveSurfer;
    } else {
      if (localWaveSurferRef.current) {
        localWaveSurferRef.current.destroy();
        localWaveSurferRef.current = null;
      }
    }
  }, [recordedAudio]);

  // Start recording audio
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      setRecordedAudio(audioBlob);
    };

    mediaRecorder.start();
    audioRecorder.current = mediaRecorder;
    setIsRecording(true);
  };

  // Stop recording audio
  const stopRecording = () => {
    if (audioRecorder.current && audioRecorder.current.state === "recording") {
      audioRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // Helper function to upload any file (image, video, audio) to server
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("File upload failed");
    }
    const data = await response.json();
    return data.url; // Return the URL from server
  };

  // Send the message (with optional attachment/audio)
  const handleSendMessage = async () => {
    let attachmentUrl = null;
    let audioUrl = null;

    if (attachment) {
      try {
        attachmentUrl = await uploadFile(attachment);
      } catch (err) {
        console.error("Error uploading file:", err);
        return;
      }
    }

    if (recordedAudio) {
      try {
        audioUrl = await uploadFile(
          new File([recordedAudio], "audio.wav", { type: "audio/wav" })
        );
      } catch (err) {
        console.error("Error uploading audio:", err);
        return;
      }
    }

    const msgObj = {
      roomCode,
      username,
      message: message.trim(),
      attachment: attachmentUrl,
      audio: audioUrl,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Emit the message
    socket.emit("sendMessage", msgObj);

    // Reset everything
    setMessage("");
    setAttachment(null);
    setRecordedAudio(null);
  };

  return (
    <div
      className="d-flex flex-column"
      style={{
        height: "100vh",
        position: "relative",
        zIndex: 1,
        background: "linear-gradient(20deg, #ff1493, #00b7ff, #ff1493)",
        backgroundSize: "400% 400%",
        animation: "gradientAnimation 2s ease infinite",
      }}      
    >
      <header
        className="container-fluid fixed-top bg-white border-bottom"
        style={{ padding: "10px" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <span
            style={{ fontSize: "1.0rem", cursor: "pointer" }}
            onClick={() => navigate("/ChatLanding")}
          >
            dont press me
          </span>
          <span className="fw-bold">Room: {generatedRoom}</span>
        </div>
      </header>

      <main
        className="container-fluid flex-grow-1"
        style={{
          paddingTop: "70px",
          paddingBottom: "70px",
          overflowY: "auto",
        }}
      >
        {messages.length === 0 && (
          <p className="text-center text-muted">No messages yet.</p>
        )}

        {messages.map((msg, index) => {
          const isMyMessage = msg.username === username;
          return (
            <div
              key={index}
              className={`d-flex ${
                isMyMessage ? "justify-content-end" : "justify-content-start"
              }`}
            >
              <div
                className={`p-2 m-2 rounded ${
                  isMyMessage ? "bg-success text-white" : "bg-light"
                }`}
                style={{ maxWidth: "70%" }}
              >
                {!isMyMessage && <strong>{msg.username}: </strong>}

                {/* Text message */}
                {msg.message && <div>{msg.message}</div>}

                {/* Attachment (image/video) */}
                {msg.attachment && (
                  <div className="mt-2">
                    {isVideoFile(msg.attachment) ? (
                      <video
                        src={msg.attachment}
                        className="img-fluid rounded"
                        controls
                        style={{ maxWidth: "100%", height: "auto" }}
                      >
                        Your browser does not support the video element.
                      </video>
                    ) : (
                      <img
                        src={msg.attachment}
                        alt="attachment"
                        className="img-fluid rounded"
                      />
                    )}
                  </div>
                )}

                {/* Audio message (WaveSurfer) */}
                {msg.audio && (
                  <div className="mt-2">
                    <div
                      id={`waveform-${index}`}
                      style={{ width: "250px", height: "50px" }}
                    />
                    <button
                      className="btn btn-sm btn-dark mt-2"
                      onClick={() => {
                        if (waveSurferRefs.current[index]) {
                          waveSurferRefs.current[index].playPause();
                        }
                      }}
                    >
                      Play/Pause
                    </button>
                  </div>
                )}

                {/* Timestamp + single tick */}
                <div
                  className="text-end"
                  style={{ fontSize: "0.75rem", color: "#000" }}
                >
                  <span style={{ marginRight: "5px" ,color: "#fff"}}>✔</span>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <footer
        className="container-fluid fixed-bottom bg-white border-top"
        style={{ padding: "10px" }}
      >
        <div className="d-flex align-items-center">
          {/* Attachment button */}
          <button
            className="btn btn-link p-0 me-2"
            style={{ fontSize: "1.5rem" }}
            onClick={() => fileInputRef.current.click()}
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="d-none"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setAttachment(e.target.files[0]);
              }
            }}
            accept="image/*,video/*,audio/*,application/pdf"
          />

          {/* Record/Stop button */}
          <button
            className="btn btn-link p-0 me-2"
            style={{ fontSize: "1.5rem" }}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? "⏹️" : "🎙️"}
          </button>

          {/* Text input */}
          <input
            type="text"
            className="form-control me-2"
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />

          {/* Send button */}
          <button className="btn btn-primary" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </footer>

      {/* Attachment preview (if any) */}
      {attachment && (
        <div
          className="position-fixed"
          style={{
            bottom: "70px",
            left: "10px",
            background: "#fff",
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            zIndex: 11,
          }}
        >
          {/* No "Attachment:" label, just a direct preview */}
          {attachment.type.startsWith("video/") ? (
            <video
              src={URL.createObjectURL(attachment)}
              controls
              style={{ maxWidth: "100px", maxHeight: "100px" }}
            />
          ) : (
            <img
              src={URL.createObjectURL(attachment)}
              alt="preview"
              style={{ maxWidth: "100px", maxHeight: "100px" }}
            />
          )}
        </div>
      )}

      {/* Local audio preview (only if we have recordedAudio) */}
      {recordedAudio && (
        <div
          className="position-fixed"
          style={{
            bottom: "70px",
            left: "120px", // move it so it doesn't overlap the attachment preview
            background: "#fff",
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            zIndex: 11,
          }}
        >
          <div
            id="local-waveform"
            ref={localWaveformRef}
            style={{ width: "250px", height: "50px" }}
          />
          <button
            className="btn btn-sm btn-dark mt-2"
            onClick={() => {
              if (localWaveSurferRef.current) {
                localWaveSurferRef.current.playPause();
              }
            }}
          >
            Play/Pause
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatMain;
