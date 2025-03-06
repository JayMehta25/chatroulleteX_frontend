import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./socket"; // import the shared socket
import "bootstrap/dist/css/bootstrap.min.css";
import Particles from './particlepage'; // Import the Particles component
import Swal from 'sweetalert2';

function ChatLanding() {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    if (username.trim()) {
      socket.emit("createRoom", username, (response) => {
        Swal.close();
        
        if (response && response.error) {
          console.error("Room creation error:", response.error);
          Swal.fire({
            title: 'Error',
            text: response.error,
            icon: 'error'
          });
          return;
        }
        
        // Store the room code
        localStorage.setItem('currentRoomCode', response);
        console.log("Room created successfully, code:", response);
        
        // FIX: Use lowercase 'chatmain' to match route definition
        try {
          console.log("Navigating to chatmain with:", { username, roomCode: response });
          navigate("/chatmain", { 
            state: { username, roomCode: response },
            replace: true
          });
        } catch (error) {
          console.error("Navigation error:", error);
          Swal.fire({
            title: 'Navigation Error',
            text: 'Could not navigate to chat room. Please try again.',
            icon: 'error'
          });
        }
      });
    }
  };

  const joinRoom = () => {
    if (roomCode.trim() && username.trim()) {
      socket.emit("joinRoom", { roomCode, username }, (response) => {
        if (response && response.error) {
          console.error(response.error);
          return;
        }
        // FIX: Use lowercase 'chatmain' to match route definition
        navigate("/chatmain", { 
          state: { username, roomCode },
          replace: true
        });
      });
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'black',
    }}>
      <Particles
        particleCount={400}
        particleSpread={4.2}
        speed={0.4}
        particleColors={["#00b7eb"]}
        moveParticlesOnHover={true}
        particleHoverFactor={1}
        alphaParticles={true}
        particleBaseSize={100}
        sizeRandomness={1}
        cameraDistance={20}
        disableRotation={false}
        className="custom-particles"
      />
      <div className="container d-flex flex-column justify-content-center align-items-center" style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: 1,
        padding: '20px',
      }}>
        <div className="text-center" style={{ pointerEvents: 'auto' }}>
          <h1 
            className="mb-4 text-white" 
            style={{
              textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #00b7eb, 0 0 70px #00b7eb, 0 0 80px #00b7eb, 0 0 100px #00b7eb, 0 0 150px #00b7eb',
              animation: 'glow 3s ease-in-out infinite alternate'
            }}
          >
            ChatRouletteX
          </h1>
          <style>{`
            @keyframes glow {
              from { text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #00b7eb, 0 0 70px #00b7eb, 0 0 80px #00b7eb, 0 0 100px #00b7eb, 0 0 150px #00b7eb; }
              to { text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6; }
            }
          `}</style>

          <input
            className="form-control mb-3"
            type="text"
            placeholder="Enter Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              boxShadow: '0 0 10px rgba(0, 183, 235, 0.5)',
              padding: '10px 15px',
              pointerEvents: 'auto'
            }}
          />
          <button 
            className="btn btn-primary mb-3" 
            onClick={createRoom}
            style={{ 
              background: 'rgba(0, 183, 235, 0.7)', 
              borderColor: 'transparent',
              boxShadow: '0 0 10px rgba(0, 183, 235, 0.5)',
              pointerEvents: 'auto'
            }}
          >
            Generate Chat Room Code
          </button>
          <input
            className="form-control mb-3"
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              boxShadow: '0 0 10px rgba(0, 183, 235, 0.5)',
              padding: '10px 15px',
              pointerEvents: 'auto'
            }}
          />
          <button 
            className="btn btn-secondary" 
            onClick={joinRoom}
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderColor: 'transparent',
              color: 'white',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
              pointerEvents: 'auto'
            }}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatLanding;