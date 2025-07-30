import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const socket = io('https://vibester-backend12.onrender.com');
function VoiceCall() {
  const location = useLocation();
  // Get room code and username ONLY from navigation state
  const navRoomCode = location.state?.roomCode || '';
  const navUsername = location.state?.username || '';

  const [joined, setJoined] = useState(false);
  // Pre-fill the input with the room code from navigation
  const [room, setRoom] = useState(navRoomCode);
  const [userCount, setUserCount] = useState(1);
  const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: MediaStream }
  const [userIds, setUserIds] = useState([]); // List of socket IDs in the room
  const localAudio = useRef();
  const peers = useRef({}); // { socketId: RTCPeerConnection }
  const localStream = useRef();

  // Listen for user count updates
  useEffect(() => {
    socket.on('user-count', count => {
      setUserCount(count);
    });
    return () => {
      socket.off('user-count');
    };
  }, []);

  // Clean up peer connections and streams on unmount
  useEffect(() => {
    return () => {
      Object.values(peers.current).forEach(pc => pc.close());
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Join the room and set up signaling for group calls
  const joinRoom = async () => {
    console.log('joinRoom called');
    localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    localAudio.current.srcObject = localStream.current;
    console.log('Local stream acquired');
    socket.emit('join', room);

    // When joining, get all other users in the room
    socket.on('all-users', users => {
      console.log('All users in room:', users);
      setUserIds([socket.id, ...users.filter(id => id !== socket.id)]);
      users.forEach(socketId => {
        if (socketId !== socket.id) {
          createPeerConnection(socketId, true);
        }
      });
    });

    // When a new user joins, create a connection to them
    socket.on('user-joined', socketId => {
      console.log('User joined:', socketId);
      setUserIds(prev => {
        if (!prev.includes(socketId)) return [...prev, socketId];
        return prev;
      });
      if (socketId !== socket.id) {
        createPeerConnection(socketId, false);
      }
    });

    // When a user leaves, clean up their connection and stream
    socket.on('user-left', socketId => {
      console.log('User left:', socketId);
      setUserIds(prev => prev.filter(id => id !== socketId));
      if (peers.current[socketId]) {
        peers.current[socketId].close();
        delete peers.current[socketId];
        setRemoteStreams(prev => {
          const copy = { ...prev };
          delete copy[socketId];
          return copy;
        });
      }
    });

    // Handle incoming signals (SDP/ICE)
    socket.on('signal', async ({ from, data }) => {
      console.log('Signal received from', from, data);
      let pc = peers.current[from];
      if (!pc) {
        pc = createPeerConnection(from, false);
      }
      if (data.sdp) {
        console.log('Setting remote description from', from, data.sdp.type);
        if (data.sdp.type === 'offer') {
          await pc.setRemoteDescription(new window.RTCSessionDescription(data.sdp));
          const answer = await pc.createAnswer();
          // Only set local description if in the correct state
          if (pc.signalingState === 'have-remote-offer') {
            await pc.setLocalDescription(answer);
            console.log('Sending answer to', from);
            socket.emit('signal', { to: from, data: { sdp: pc.localDescription } });
          } else {
            console.warn(
              `Skipping setLocalDescription for answer: signalingState is ${pc.signalingState}, expected 'have-remote-offer'`
            );
          }
        } else if (data.sdp.type === 'answer') {
          // Only set remote answer if in the correct signaling state
          if (pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new window.RTCSessionDescription(data.sdp));
          } else {
            console.warn(
              `Skipping setRemoteDescription for answer: signalingState is ${pc.signalingState}, expected 'have-local-offer'`
            );
          }
        }
      } else if (data.candidate) {
        try {
          console.log('Adding ICE candidate from', from);
          await pc.addIceCandidate(new window.RTCIceCandidate(data.candidate));
        } catch (e) { console.error('Error adding ICE candidate', e); }
      }
    });

    setJoined(true);
  };

  // Create a peer connection for a given socketId
  function createPeerConnection(socketId, isInitiator) {
    console.log('Creating peer connection for', socketId, 'isInitiator:', isInitiator);
    const pc = new window.RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ]
    });
    peers.current[socketId] = pc;
    localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current));
    pc.onicecandidate = e => {
      if (e.candidate) {
        console.log('Sending ICE candidate to', socketId);
        socket.emit('signal', { to: socketId, data: { candidate: e.candidate } });
      }
    };
    pc.ontrack = e => {
      console.log('Received remote track from', socketId, e.streams[0]);
      setRemoteStreams(prev => ({ ...prev, [socketId]: e.streams[0] }));
    };
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state for', socketId, ':', pc.iceConnectionState);
    };
    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        console.log('Negotiation needed for', socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('Sending offer to', socketId);
        socket.emit('signal', { to: socketId, data: { sdp: pc.localDescription } });
      };
    }
    return pc;
  }

  return (
    <div style={{ padding: 40 }}>
      {navRoomCode && (
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 16 }}>
          Room Code: {navRoomCode}
        </div>
      )}
      <h2>P2P Voice Chat (Group)</h2>
      {/* User Avatars UI */}
      {joined && (
        <div style={{ marginBottom: 10 }}>
          <b>Users in call:</b> {userCount}
        </div>
      )}
      {!joined ? (
        <div>
          <input
            placeholder="Room name"
            value={room}
            onChange={e => setRoom(e.target.value)}
          />
          <button onClick={() => { console.log('Join button clicked'); joinRoom(); }} disabled={!room}>Join</button>
        </div>
      ) : (
        <div>
          <p>Connected! Start talking.</p>
        </div>
      )}
      {/* Local audio (muted) */}
      <audio ref={localAudio} autoPlay muted />
      {/* Render and log each remote audio element */}
      {Object.entries(remoteStreams).map(([id, stream]) => (
        <audio
          key={id}
          ref={el => {
            if (el && stream) {
              el.srcObject = stream;
              el.onplay = () => console.log('Audio playing for', id);
              el.onpause = () => console.log('Audio paused for', id);
            }
          }}
          autoPlay
        />
      ))}
    </div>
  );
}

export default VoiceCall; 