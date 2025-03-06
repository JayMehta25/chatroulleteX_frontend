import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import socket from "./socket"; // using the shared socket
import "bootstrap/dist/css/bootstrap.min.css";

// Add glitch animation styles
const glitchStyles = `
  @keyframes glitch {
    0% { background-position: 0 0; }
    20% { background-position: -10px 5px; }
    40% { background-position: 10px -5px; }
    60% { background-position: -10px 5px; }
    80% { background-position: 10px -5px; }
    100% { background-position: 0 0; }
  }
`;

// Simple helper to check if a URL is likely a video
// (works if the URL ends in .mp4, .mov, .webm, etc.)
function isVideoFile(url = "") {
  return /\.(mp4|mov|avi|webm)$/i.test(url);
}

// Add MIME type detection helper
const getMediaType = (file) => {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("image/")) return "image";
  return "file";
};

function ChatMain() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, roomCode } = location.state || {};

  useEffect(() => {
    if (!username || !roomCode) {
      navigate("/"); // Redirect if the username or roomCode is not provided
    }
  }, [username, roomCode, navigate]);

  const [backgroundImage, setBackgroundImage] = useState(null);
  const [previewBackground, setPreviewBackground] = useState(null);
  const [generatedRoom] = useState(roomCode || "");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);

  // Refs initialization
  const audioRecorder = useRef(null);
  const fileInputRef = useRef(null);
  const waveSurferRefs = useRef([]);
  const localWaveformRef = useRef(null);
  const localWaveSurferRef = useRef(null);

  // Double tap handler for likes
  const handleDoubleTap = (index) => {
    const updatedMessages = [...messages];
    if (!updatedMessages[index].likes) updatedMessages[index].likes = [];
    if (!updatedMessages[index].likes.includes(username)) {
      updatedMessages[index].likes.push(username);
      setMessages(updatedMessages);
      socket.emit("likeMessage", { 
        roomCode, 
        messageId: updatedMessages[index].id 
      });
    }
  };

  // Socket listeners
  useEffect(() => {
    const messageHandler = (msg) => {
      setMessages(prev => {
        const existing = prev.find(m => m.id === msg.id);
        return existing 
          ? prev.map(m => m.id === msg.id ? {...msg, isSending: false} : m)
          : [...prev, {...msg, likes: msg.likes || []}];
      });
    };
    
    const likeHandler = ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? {...msg, likes: [...msg.likes, username]} : msg
      ));
    };

    socket.on("receiveMessage", messageHandler);
    socket.on("messageLiked", likeHandler);
    return () => {
      socket.off("receiveMessage", messageHandler);
      socket.off("messageLiked", likeHandler);
    };
  }, [username]);

  // WaveSurfer initialization effect
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.audio && !waveSurferRefs.current[msg.id]) {
        const containerId = `waveform-${msg.id}`;
        const existingContainer = document.getElementById(containerId);

        // Only create WaveSurfer if the container exists
        if (existingContainer) {
          const waveSurfer = WaveSurfer.create({
            container: `#${containerId}`,
            waveColor: "#333",
            progressColor: "#e6e6e6",
            barWidth: 2,
            barHeight: 1,
            height: 50,
            cursorWidth: 1,
          });

          waveSurfer.load(msg.audio.url || msg.audio.preview);
          waveSurferRefs.current[msg.id] = waveSurfer;
        } else {
          console.warn(`Container with ID ${containerId} not found for message ID ${msg.id}`);
        }
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

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
    mediaRecorder.onstop = () => setRecordedAudio(new Blob(audioChunks, { type: "audio/wav" }));
    
    mediaRecorder.start();
    audioRecorder.current = mediaRecorder;
    setIsRecording(true);
  };

  // Stop recording audio
  const stopRecording = () => {
    if (audioRecorder.current?.state === "recording") {
      audioRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // Modified uploadFile function with MIME type preservation
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const data = await response.json();
      return {
        url: data.url,
        type: getMediaType(file),
        mime: file.type
      };
    } catch (err) {
      console.error("Upload error:", err.message);
      throw err;
    }
  };

  // Enhanced message sending handler
  const handleSendMessage = async () => {
    if (isSendingRef.current || (!message.trim() && !attachment && !recordedAudio)) return;

    isSendingRef.current = true;
    setIsSending(true);

    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      roomCode,
      username,
      message: message.trim(),
      attachment: attachment ? {
        preview: URL.createObjectURL(attachment),
        type: getMediaType(attachment),
        mime: attachment.type
      } : null,
      audio: recordedAudio ? {
        preview: URL.createObjectURL(recordedAudio),
        mime: recordedAudio.type
      } : null,
      timestamp: new Date().toLocaleTimeString(),
      likes: [],
      isSending: true
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const uploads = [];
      
      if (attachment) {
        uploads.push(uploadFile(attachment).then(result => ({
          type: "attachment",
          ...result
        })));
      }

      if (recordedAudio) {
        const audioFile = new File([recordedAudio], "audio", { type: recordedAudio.type });
        uploads.push(uploadFile(audioFile).then(result => ({
          type: "audio",
          ...result
        })));
      }

      const results = await Promise.all(uploads);
      
      const finalMsg = {
        ...tempMessage,
        isSending: false
      };

      results.forEach(result => {
        if (result.type === "attachment") {
          finalMsg.attachment = {
            url: result.url,
            type: result.type,
            mime: result.mime
          };
        } else if (result.type === "audio") {
          finalMsg.audio = {
            url: result.url,
            mime: result.mime
          };
        }
      });

      setMessages(prev => prev.map(msg => msg.id === tempId ? finalMsg : msg));
      socket.emit("sendMessage", finalMsg);
    } catch (err) {
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      console.error("Message send error:", err);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
      setMessage("");
      setAttachment(null);
      setRecordedAudio(null);
    }
  };

  // Handle background image selection
  const handleBackgroundSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewBackground(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmBackground = () => {
    setBackgroundImage(previewBackground);
    setPreviewBackground(null);
  };

  const cancelPreview = () => {
    setPreviewBackground(null);
  };

  return (
    <div
      className="d-flex flex-column"
      style={{
        height: "100vh",
        position: "relative",
        backgroundImage: previewBackground 
          ? `url(${previewBackground})` 
          : backgroundImage 
            ? `url(${backgroundImage})` 
            : "linear-gradient(45deg, #ff1493, #00b7ff, #ff1493)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Removed glitch effect styles */}

      {/* Preview Overlay */}
      {previewBackground && (
        <div className="preview-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div className="preview-content" style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center"
          }}>
            <h4 className="mb-4">Preview Background</h4>
            <div className="button-group">
              <button 
                className="btn btn-success mx-2"
                onClick={confirmBackground}
              >
                Confirm
              </button>
              <button 
                className="btn btn-danger mx-2"
                onClick={cancelPreview}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <header
        className="container-fluid fixed-top bg-white border-bottom d-flex justify-content-between align-items-center"
        style={{ padding: "10px" }}
      >
        <div>
          <h5>{`Room: ${generatedRoom}`}</h5>
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundSelect}
            style={{ display: "none" }}
            id="backgroundInput"
          />
          <label 
            htmlFor="backgroundInput"
            className="btn btn-light"
          >
            Change Background
          </label>
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

        {messages.map((msg) => {
          const isMyMessage = msg.username === username;
          return (
            <div key={msg.id} className={`d-flex ${isMyMessage ? "justify-content-end" : "justify-content-start"}`}>
              <div className={`p-2 m-2 rounded ${isMyMessage ? "bg-success text-white" : "bg-light"}`} 
                   style={{ maxWidth: "70%", borderRadius: isMyMessage ? "18px 18px 4px 18px" : "18px 18px 18px 4px" }}
                   data-message-id={msg.id}>
                
                {!isMyMessage && <strong>{msg.username}: </strong>}
                {msg.message && <div>{msg.message}</div>}

                {msg.attachment && (
                  <div className="mt-2">
                    {msg.attachment.type === "video" ? (
                      <video 
                        src={msg.attachment.url || msg.attachment.preview} 
                        controls 
                        className="img-fluid rounded" 
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    ) : msg.attachment.type === "image" ? (
                      <img 
                        src={msg.attachment.url || msg.attachment.preview} 
                        alt="attachment" 
                        className="img-fluid rounded"
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    ) : (
                      <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer">
                        Download File
                      </a>
                    )}
                  </div>
                )}

                {msg.audio && (
                  <div className="mt-2 audio-container">
                    <div id={`waveform-${msg.id}`} style={{ width: "250px", height: "50px" }} />
                    <button 
                      className="btn btn-sm btn-dark mt-2"
                      onClick={() => waveSurferRefs.current[msg.id]?.playPause()}
                    >
                      Play/Pause
                    </button>
                  </div>
                )}

                <div className="text-end" style={{ fontSize: "0.75rem", color: "#000" }}>
                  <span style={{ marginRight: "5px", color: "#fff" }}>✔</span>
                  {msg.timestamp}
                  {msg.isSending && <span className="ms-2 text-muted">Sending...</span>}
                </div>

                {msg.likes?.length > 0 && (
                  <div className="text-start mt-1" style={{ fontSize: "0.75rem" }}>
                    ❤️ {msg.likes.length}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      <footer
        className="container-fluid fixed-bottom bg-white border-top"
        style={{ padding: "10px" }}
      >
        <div className="d-flex align-items-center gap-2">
          {/* Updated attachment button */}
          <button
            className="btn btn-light rounded-circle p-2"
            onClick={() => fileInputRef.current.click()}
            style={{ width: "40px", height: "40px" }}
          >
            ➕
          </button>

          {/* Updated record button */}
          <button
            className={`btn rounded-circle p-2 ${isRecording ? "btn-danger" : "btn-light"}`}
            onClick={isRecording ? stopRecording : startRecording}
            style={{ width: "40px", height: "40px" }}
          >
            {isRecording ? "⏹️" : "🎤"}
          </button>

          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            style={{ backgroundColor: "#333", color: "#fff" }}
          />

          <button className="btn btn-primary rounded-circle p-2" style={{ width: "40px", height: "40px" }}
                  onClick={handleSendMessage} disabled={isSending}>
            {isSending ? "⏳" : "➤"}
          </button>

          {/* Hidden file input for attachments */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => setAttachment(e.target.files[0])}
          />
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

      {/* Add CSS for speech bubbles */}
      <style>
        {`
          .speech-arrow-right {
            position: absolute;
            right: -8px;
            top: 0;
            width: 0;
            height: 0;
            border: 10px solid transparent;
            border-left-color: #198754;
            border-right: 0;
          }
          .speech-arrow-left {
            position: absolute;
            left: -8px;
            top: 0;
            width: 0;
            height: 0;
            border: 10px solid transparent;
            border-right-color: #f8f9fa;
            border-left: 0;
          }
        `}
      </style>
    </div>
  );
}

export default ChatMain;