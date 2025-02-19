// ChatMain.js
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import socket from "./socket"; // using the shared socket
import "bootstrap/dist/css/bootstrap.min.css";

function ChatMain() {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve username and roomCode from location.state
  const { username, roomCode } = location.state || {};

  // Redirect if required parameters are missing
  useEffect(() => {
    if (!username || !roomCode) {
      navigate("/");
    }
  }, [username, roomCode, navigate]);

  const [generatedRoom, setGeneratedRoom] = useState(roomCode || "");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const fileInputRef = useRef(null);
  const audioRecorder = useRef(null);
  const previewCanvasRef = useRef(null);

  // Listen for incoming messages
  useEffect(() => {
    const messageHandler = (msg) => {
      console.log("New message received:", msg); // Debug log
      setMessages((prevMessages) => [...prevMessages, msg]); // Update state with new message
    };

    // Socket listener for receiving messages
    socket.on("receiveMessage", messageHandler);

    // Cleanup on component unmount
    return () => {
      socket.off("receiveMessage", messageHandler);
    };
  }, []);

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
    return data.url;
  };

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
      generateWaveform(audioBlob);
    };

    mediaRecorder.start();
    audioRecorder.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (audioRecorder.current && audioRecorder.current.state === "recording") {
      audioRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const generateWaveform = (audioBlob) => {
    if (previewCanvasRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: previewCanvasRef.current,
        waveColor: "#333",
        progressColor: "#e6e6e6",
        barWidth: 2,
        barHeight: 1,
        height: 50,
        cursorWidth: 1,
      });
      wavesurfer.loadBlob(audioBlob);
    }
  };

  const handleSendMessage = async () => {
    let attachmentUrl = null;
    let audioUrl = null;

    // Upload attachment if it exists
    if (attachment) {
      try {
        attachmentUrl = await uploadFile(attachment);
      } catch (err) {
        console.error("Error uploading file:", err);
        return;
      }
    }

    // Upload audio if recorded
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

    // Emit message to the server
    socket.emit("sendMessage", msgObj);

    // Reset message, attachment, and audio states after sending
    setMessage("");
    setAttachment(null);
    setRecordedAudio(null);
  };

  return (
    // Chat UI container
    <div
      className="d-flex flex-column"
      style={{
        height: "100vh",
        position: "relative",
        zIndex: 1,
        backgroundColor: "rgb(0, 0, 0)",
      }}
    >
      <header
        className="container-fluid fixed-top bg-white border-bottom"
        style={{ padding: "10px" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <span
            style={{ fontSize: "1.5rem", cursor: "pointer" }}
            onClick={() => navigate("/ChatLanding")}
          >
            Back
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
        {/* Display a placeholder when no messages are available */}
        {messages.length === 0 && (
          <p className="text-center text-muted">No messages yet.</p>
        )}

        {/* Display messages in the chat box */}
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
                {msg.message && <div>{msg.message}</div>}
                {msg.attachment && (
                  <div className="mt-2">
                    <img
                      src={msg.attachment}
                      alt="attachment"
                      className="img-fluid rounded"
                    />
                  </div>
                )}
                {msg.audio && (
                  <div className="mt-2">
                    <audio controls src={msg.audio} className="mt-2 w-100">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                <div
                  className="text-end"
                  style={{ fontSize: "0.75rem", color: "#999" }}
                >
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
          <button
            className="btn btn-link p-0 me-2"
            style={{ fontSize: "1.5rem" }}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? "⏹️" : "🎙️"}
          </button>
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
          <button className="btn btn-primary" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </footer>

      {/* Recording preview (if any) */}
      {recordedAudio && (
        <div
          className="position-fixed"
          style={{
            bottom: "70px",
            left: "130px",
            background: "#fff",
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            zIndex: 11,
          }}
        >
          <strong>Audio:</strong>
          <div ref={previewCanvasRef} style={{ width: "300px", height: "50px" }} />
          <audio controls src={URL.createObjectURL(recordedAudio)} />
        </div>
      )}

      {/* Attachment preview */}
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
          <strong>Attachment:</strong>
          <div>
            {attachment.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(attachment)}
                alt="preview"
                style={{ maxWidth: "100px", maxHeight: "100px" }}
              />
            ) : (
              <span>{attachment.name}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMain;
