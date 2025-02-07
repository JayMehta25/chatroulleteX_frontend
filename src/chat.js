import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

// Connect to the backend using your ngrok URL
const socket = io("https://backend-production-4c02.up.railway.app/", {
  transports: ["websocket"],
  withCredentials: true,
});


// Debug WebSocket Connection
socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server:", socket.id);
});
socket.on("connect_error", (err) => {
  console.log("❌ Connection Error:", err.message);
});

function Chat() {
  // Basic chat states
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [generatedRoom, setGeneratedRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [inRoom, setInRoom] = useState(false);
  const [error, setError] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [theme, setTheme] = useState("light"); // Using a light base to match Instagram vibe

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Typing indicator state (for other users)
  const [typingUsers, setTypingUsers] = useState([]);

  // Toggle theme with a smooth transition
  const toggleTheme = () => {
    document.body.style.transition = "all 0.5s ease";
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // Create and join room functions
  const createRoom = () => {
    if (!username.trim()) {
      setError("Please enter your name before creating a room!");
      return;
    }
    socket.emit("createRoom", username);
  };

  const joinRoom = () => {
    const trimmedRoomCode = roomCode.trim();
    if (!username.trim()) {
      setError("Please enter your name before joining a room!");
      return;
    }
    if (trimmedRoomCode !== "") {
      console.log(`🔍 Attempting to join room: ${trimmedRoomCode}`);
      socket.emit("joinRoom", { roomCode: trimmedRoomCode, username });
    } else {
      setError("❌ Please enter a valid room code!");
    }
  };

  // Handle room events from the server
  useEffect(() => {
    socket.on("roomCreated", (room) => {
      setGeneratedRoom(room);
      setInRoom(true);
      setError(null);
      console.log("✅ Room created:", room);
    });
    socket.on("roomJoined", (room) => {
      setGeneratedRoom(room);
      setInRoom(true);
      setError(null);
      console.log("✅ Joined room:", room);
    });
    socket.on("userCount", (count) => {
      setUserCount(count);
    });
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    socket.on("error", (errorMessage) => {
      setError(errorMessage);
      console.log(`❌ Error: ${errorMessage}`);
    });
    // Listen for typing events from other users
    socket.on("userTyping", (data) => {
      if (data.username !== username) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.username)) return [...prev, data.username];
          return prev;
        });
        // Remove the typing indicator after 2 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((user) => user !== data.username));
        }, 2000);
      }
    });
    // Listen for like events from the server
    socket.on("receiveLike", (data) => {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        const idx = data.messageIndex;
        if (newMessages[idx]) {
          if (!newMessages[idx].reactions) newMessages[idx].reactions = {};
          newMessages[idx].reactions["❤️"] =
            (newMessages[idx].reactions["❤️"] || 0) + 1;
        }
        return newMessages;
      });
    });
    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("userCount");
      socket.off("receiveMessage");
      socket.off("error");
      socket.off("userTyping");
      socket.off("receiveLike");
    };
  }, [username]);

  // Audio recording functions using MediaRecorder API
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setRecordedAudio(reader.result);
        };
      });
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // When the user types a message, emit a "typing" event to the server
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    if (generatedRoom) {
      socket.emit("typing", { roomCode: generatedRoom, username });
    }
  };

  // Send message with optional audio and timestamp
  const sendMessage = () => {
    if (!generatedRoom) return;
    if (message.trim() === "" && !recordedAudio) return;
    const timestamp = new Date().toLocaleTimeString();
    socket.emit("sendMessage", {
      roomCode: generatedRoom,
      username,
      message,
      audio: recordedAudio,
      timestamp,
    });
    setMessage("");
    setRecordedAudio(null);
  };

  // Handle double tap (like) event
  const handleDoubleTap = (messageIndex) => {
    socket.emit("likeMessage", { roomCode: generatedRoom, messageIndex });
  };

  // Local reaction (for manual clicks)
  const addReaction = (index, emoji) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      const msg = newMessages[index];
      if (!msg.reactions) msg.reactions = {};
      if (!msg.reactions[emoji]) msg.reactions[emoji] = 0;
      msg.reactions[emoji] += 1;
      return newMessages;
    });
    if (emoji === "❤️") {
      socket.emit("likeMessage", { roomCode: generatedRoom, messageIndex: index });
    }
  };

  // Clear local chat messages
  const clearChat = () => {
    setMessages([]);
  };

  // Inline styles – upgraded for an even more complex, "mind-blowing" background and enhanced input UI
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(270deg, #ff6b6b, #feca57, #48dbfb, #1dd1a1, #5f27cd)",
      backgroundSize: "400% 400%",
      animation: "gradientAnimation 10s ease infinite",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    },
    header: {
      marginBottom: "20px",
      textAlign: "center",
    },
    title: {
      fontSize: "2.8rem",
      fontWeight: "bold",
      background:
        "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "10px",
    },
    toggleSwitch: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
      cursor: "pointer",
    },
    switch: {
      position: "relative",
      width: "50px",
      height: "25px",
      borderRadius: "15px",
      background: theme === "dark" ? "#333" : "#ddd",
      marginRight: "10px",
    },
    switchKnob: {
      position: "absolute",
      top: "2px",
      left: theme === "dark" ? "2px" : "calc(100% - 23px)",
      width: "21px",
      height: "21px",
      borderRadius: "50%",
      background: theme === "dark" ? "#f09433" : "#dc2743",
      transition: "left 0.3s",
    },
    input: {
      padding: "12px 15px",
      fontSize: "1rem",
      borderRadius: "8px",
      border: "2px solid rgba(0,0,0,0.2)",
      margin: "8px 0",
      width: "90%",
      maxWidth: "350px",
      transition: "all 0.3s ease",
      background: "rgba(255,255,255,0.8)",
    },
    button: {
      padding: "12px 25px",
      fontSize: "1rem",
      borderRadius: "25px",
      border: "none",
      background:
        "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
      color: "#fff",
      cursor: "pointer",
      margin: "10px 0",
      transition: "transform 0.3s, box-shadow 0.3s",
    },
    chatContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      width: "100%",
      maxWidth: "500px",
      background: theme === "dark" ? "#111" : "#fff",
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "15px",
      marginBottom: "20px",
      overflowY: "auto",
      height: "300px", // Fixed height container
    },
    messageCard: {
      border: "1px solid #eee",
      borderRadius: "8px",
      padding: "10px",
      position: "relative",
      maxWidth: "80%",
    },
    reactionBar: {
      display: "flex",
      gap: "10px",
      marginTop: "5px",
    },
    emojiButton: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "1.2rem",
    },
    audioRecorder: {
      width: "100%",
      maxWidth: "500px",
      background: theme === "dark" ? "#222" : "#fff",
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "15px",
      marginBottom: "20px",
      textAlign: "center",
    },
    audioButton: {
      padding: "10px 20px",
      fontSize: "1rem",
      borderRadius: "25px",
      border: "none",
      background:
        "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
      color: "#fff",
      cursor: "pointer",
      margin: "10px 0",
      transition: "transform 0.3s, box-shadow 0.3s",
    },
    clearButton: {
      padding: "8px 16px",
      fontSize: "0.9rem",
      borderRadius: "20px",
      border: "none",
      background: "#eee",
      color: "#333",
      cursor: "pointer",
      margin: "10px 0",
    },
    typingIndicator: {
      fontStyle: "italic",
      color: "#666",
      marginTop: "5px",
    },
    audioPreview: {
      width: "100%",
      marginTop: "10px",
    },
    // New styles for the falling room digits
    roomCodeContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "20px",
      fontSize: "2rem",
      fontWeight: "bold",
    },
    roomDigit: {
      opacity: 0,
      margin: "0 5px",
      background:
        "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    // New styles for the message input with an integrated send button
    messageInputContainer: {
      display: "flex",
      alignItems: "center",
      width: "100%",
      maxWidth: "500px",
      margin: "10px 0",
    },
    messageInput: {
      flex: 1,
      padding: "12px 15px",
      fontSize: "1rem",
      border: "2px solid rgba(0,0,0,0.2)",
      borderRadius: "8px 0 0 8px",
      background: "rgba(255,255,255,0.8)",
      outline: "none",
    },
    sendButton: {
      padding: "12px 20px",
      fontSize: "1rem",
      border: "none",
      borderRadius: "0 8px 8px 0",
      background:
        "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
      color: "#fff",
      cursor: "pointer",
      transition: "transform 0.3s, box-shadow 0.3s",
    },
  };
  

  return (
    <>
      {/* Global CSS animations, including the bubble animation */}
      <style>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes fall {
          0% { transform: translateY(-100px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes bubbleIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .funButton:hover {
          transform: scale(1.05);
          box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
        }
        .funRoomDigit {
          animation: fall 0.8s ease-out forwards;
        }
        .messageBubble {
          animation: bubbleIn 0.5s ease-out;
        }
        /* Advanced input focus style */
        input {
          transition: border 0.3s ease, box-shadow 0.3s ease;
        }
        input:focus {
          outline: none;
          border-color: #ff6b6b;
          box-shadow: 0 0 10px rgba(255,107,107,0.6);
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.toggleSwitch} onClick={toggleTheme}>
          <div style={styles.switch}>
            <div style={styles.switchKnob}></div>
          </div>
          <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
        </div>
        
        {!inRoom ? (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>ChatRouletteX</h1>
            </div>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button style={styles.button} className="funButton" onClick={createRoom}>
              Generate Chat Room Code
            </button>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <button style={styles.button} className="funButton" onClick={joinRoom}>
              Join Room
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </>
        ) : (
          <div>
            <div style={styles.header}>
              {/* Display the room code with falling-digit animation */}
              <div style={styles.roomCodeContainer}>
                {String(generatedRoom)
                  .split("")
                  .map((digit, index) => (
                    <span
                      key={index}
                      style={{
                        ...styles.roomDigit,
                        animationDelay: `${index * 0.2}s`,
                      }}
                      className="funRoomDigit"
                    >
                      {digit}
                    </span>
                  ))}
              </div>
              <p>Users in Room: {userCount}</p>
            </div>
            <button style={styles.clearButton} onClick={clearChat}>
              Clear Chat
            </button>
            {/* Chat messages container */}
            <div style={styles.chatContainer}>
              {messages.map((msg, index) => {
                const isMyMessage = msg.username === username;
                return (
                  <div
                    key={index}
                    className="messageBubble"
                    style={{
                      ...styles.messageCard,
                      alignSelf: isMyMessage ? "flex-end" : "flex-start",
                      textAlign: isMyMessage ? "right" : "left",
                      background: isMyMessage
                        ? theme === "dark"
                          ? "#333"
                          : "#dcf8c6"
                        : theme === "dark"
                        ? "#222"
                        : "#f9f9f9",
                    }}
                    onDoubleClick={() => handleDoubleTap(index)}
                  >
                    <p style={{ margin: 0 }}>
                      {!isMyMessage && <strong>{msg.username}: </strong>}
                      {msg.message}
                      {msg.timestamp && (
                        <span style={{ fontSize: "0.8rem", color: "#888", marginLeft: "5px" }}>
                          ({msg.timestamp})
                        </span>
                      )}
                    </p>
                    {msg.audio && (
                      <audio controls src={msg.audio}>
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    {/* Reaction Bar */}
                    <div style={styles.reactionBar}>
                      <button
                        style={styles.emojiButton}
                        onClick={() => addReaction(index, "👍")}
                        className="funButton"
                      >
                        👍 {msg.reactions && msg.reactions["👍"] ? msg.reactions["👍"] : ""}
                      </button>
                      <button
                        style={styles.emojiButton}
                        onClick={() => addReaction(index, "😂")}
                        className="funButton"
                      >
                        😂 {msg.reactions && msg.reactions["😂"] ? msg.reactions["😂"] : ""}
                      </button>
                      <button
                        style={styles.emojiButton}
                        onClick={() => addReaction(index, "❤️")}
                        className="funButton"
                      >
                        ❤️ {msg.reactions && msg.reactions["❤️"] ? msg.reactions["❤️"] : ""}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {typingUsers.length > 0 && (
              <p style={styles.typingIndicator}>
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
              </p>
            )}
            {/* Audio Recording UI */}
            <div style={styles.audioRecorder}>
              <button
                style={styles.audioButton}
                className="funButton"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? "⏹️ Stop Recording" : "🎙️ Record Audio"}
              </button>
              {recordedAudio && (
                <div style={styles.audioPreview}>
                  <p style={{ marginBottom: "5px", fontWeight: "bold" }}>
                    Audio Preview:
                  </p>
                  <audio controls src={recordedAudio} style={{ width: "100%" }}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
            {/* Message Input with Integrated Send Button */}
            <div style={styles.messageInputContainer}>
              <input
                style={styles.messageInput}
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={handleMessageChange}
              />
              <button style={styles.sendButton} className="funButton" onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Chat;
