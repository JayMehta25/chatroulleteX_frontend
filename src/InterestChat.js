import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import socket from './socket';
import './InterestChat.css';
import Globe from 'react-globe.gl';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const InterestChat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { username: navUsername, interests } = location.state || {};
    const username = navUsername || localStorage.getItem('username') || '';
    
    const [isSearching, setIsSearching] = useState(true);
    const [isMatchFound, setIsMatchFound] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [userCount, setUserCount] = useState(0);
    const [socketId, setSocketId] = useState(socket.id);
    const [assignedRoom, setAssignedRoom] = useState(null);
    const [currentFact, setCurrentFact] = useState('');
    const globeRef = useRef();
    
    const messagesEndRef = useRef(null);
    const searchStartTimestamp = useRef(null);
    const [icebreaker, setIcebreaker] = useState(null);
    const [icebreakerLoading, setIcebreakerLoading] = useState(false);
    const [showIcebreaker, setShowIcebreaker] = useState(false);
    const [showAIDropdown, setShowAIDropdown] = useState(false);
    const [loadingType, setLoadingType] = useState('icebreaker');
    const [showBot, setShowBot] = useState(false);
    const [botMessages, setBotMessages] = useState([]);
    const [botInput, setBotInput] = useState("");
    const [botLoading, setBotLoading] = useState(false);
    const [showChatHistory, setShowChatHistory] = useState(false);
    const [showFlanChat, setShowFlanChat] = useState(false);
    const [flanMessages, setFlanMessages] = useState([]);
    const [flanInput, setFlanInput] = useState("");
    const [flanLoading, setFlanLoading] = useState(false);
    const [showCompatibility, setShowCompatibility] = useState(false);
    const [compatibilityResult, setCompatibilityResult] = useState(null);
    const [compatibilityLoading, setCompatibilityLoading] = useState(false);

    const facts = [
        "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!",
        "A day on Venus is longer than its year. Venus takes 243 Earth days to rotate on its axis but only 225 Earth days to orbit the Sun.",
        "Bananas are berries, but strawberries aren't. In botanical terms, bananas qualify as berries while strawberries are actually aggregate fruits.",
        "The shortest war in history lasted only 38 minutes. It was between Britain and Zanzibar in 1896.",
        "Octopuses have three hearts, nine brains, and blue blood. Two hearts pump blood to the gills, while the third pumps it to the rest of the body.",
        "A group of flamingos is called a 'flamboyance'. These pink birds are known for their striking group formations.",
        "The Great Wall of China is not visible from space with the naked eye, despite the popular myth. It's only about 30 feet wide!",
        "Cows have best friends and get stressed when separated from them. They're more social animals than many people realize.",
        "The average person spends 6 months of their lifetime waiting for red lights to turn green.",
        "A day on Mars is only 37 minutes longer than a day on Earth. Mars days are called 'sols'.",
        "The first oranges weren't orange. The original oranges from Southeast Asia were actually green.",
        "Penguins can jump as high as 6 feet out of water. They use this ability to escape predators and get onto ice.",
        "The human body contains enough iron to make a 3-inch nail. Most of it is in your blood.",
        "A group of owls is called a 'parliament'. This term dates back to medieval times.",
        "The average person walks the equivalent of three times around the world in a lifetime.",
        "Koalas have fingerprints that are almost identical to human fingerprints. Even experts have trouble telling them apart.",
        "The shortest complete sentence in English is 'I am.'",
        "A day on Jupiter is only 10 hours long, making it the fastest rotating planet in our solar system.",
        "The average person spends 25 years asleep in their lifetime.",
        "A group of hedgehogs is called a 'prickle'. These spiky creatures are actually quite social."
    ];

    const myData = [
      { lat: 37.7749, lng: -122.4194, size: 0.1, color: 'red' },
      { lat: 40.7128, lng: -74.0060, size: 0.1, color: 'blue' }
    ];

    useEffect(() => {
        if (globeRef.current) {
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed =4.3;
        }
    }, []);

    useEffect(() => {
        if (isMatchFound && globeRef.current) {
            globeRef.current.controls().autoRotate = false;
        }
    }, [isMatchFound]);

    // Rotating facts effect
    useEffect(() => {
        if (isSearching && !isMatchFound) {
            const showRandomFact = () => {
                const randomIndex = Math.floor(Math.random() * facts.length);
                setCurrentFact(facts[randomIndex]);
            };
            
            showRandomFact(); // Show first fact immediately
            const interval = setInterval(showRandomFact, 20000); // Change fact every 20 seconds
            
            return () => clearInterval(interval);
        }
    }, [isSearching, isMatchFound]);

    useEffect(() => {
        if (!username || !interests || interests.length === 0) {
            navigate('/Home');
            return;
        }

        searchStartTimestamp.current = Date.now();

        socket.emit('joinInterestRoom', { username, interests });

        const messageHandler = (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };
        
        const roomAssignedHandler = ({ roomName }) => {
            setAssignedRoom(roomName);
        };

        const userCountHandler = ({ count }) => {
            setUserCount(count);

            if (count > 1 && isSearching && !isMatchFound) {
                const elapsedTime = Date.now() - searchStartTimestamp.current;
                const remainingTime = 3000 - elapsedTime;

                const showMatchFoundPopup = () => {
                    setIsMatchFound(true);
                    setTimeout(() => {
                        setIsSearching(false);
                    }, 2000); // Let popup show for 2 seconds
                };

                if (remainingTime > 0) {
                    setTimeout(showMatchFoundPopup, remainingTime);
                } else {
                    showMatchFoundPopup();
                }
            }
        };
        
        socket.on('receiveInterestMessage', messageHandler);
        socket.on('interestRoomUserCount', userCountHandler);
        socket.on('interestRoomAssigned', roomAssignedHandler);

        return () => {
            socket.off('receiveInterestMessage', messageHandler);
            socket.off('interestRoomUserCount', userCountHandler);
            socket.off('interestRoomAssigned', roomAssignedHandler);
            if (assignedRoom) {
                socket.emit('leaveInterestRoom', { username, roomName: assignedRoom });
            }
        };
    }, [username, interests, navigate, isSearching, isMatchFound, assignedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (input.trim() && assignedRoom) {
            const messageData = {
                id: uuidv4(),
                username,
                roomName: assignedRoom,
                message: input,
                timestamp: new Date().toISOString(),
                likes: [],
            };
            socket.emit('sendInterestMessage', messageData);
            setInput('');
        }
    };

    // === GEMINI API ENDPOINTS ===
    const BACKEND_BASE_URL = 'https://vibester-backend12.onrender.com';
    const ICEBREAKER_API_URL = BACKEND_BASE_URL + '/api/icebreaker';
    const AI_SUGGEST_API_URL = BACKEND_BASE_URL + '/api/ai-suggest-reply';
    const FLAN_CHAT_URL = BACKEND_BASE_URL + '/api/gemini-chat'; // Optionally rename to GEMINI_CHAT_URL in your backend
    // ==============================

    const fetchIcebreaker = async () => {
        setIcebreakerLoading(true);
        setShowIcebreaker(true);
        setLoadingType('icebreaker');
        try {
            // Send only interests to the backend, let backend handle prompt
            const res = await axios.post(ICEBREAKER_API_URL, { interests });
            setIcebreaker(res.data.icebreaker);
        } catch (err) {
            setIcebreaker('Could not fetch an icebreaker. Try again!');
        }
        setIcebreakerLoading(false);
    };

    const fetchAISuggestion = async (selectedMessage = null) => {
        setIcebreakerLoading(true);
        setShowIcebreaker(true);
        setLoadingType('suggestion');
        try {
            // Prepare chat history (last 10 messages, as text)
            const chat_history = messages.slice(-10).map(m => `${m.username}: ${m.message}`);
            // Use all known participant names
            const participantNames = Array.from(new Set(messages.map(m => m.username).concat([username])));
            const res = await axios.post(AI_SUGGEST_API_URL, {
                selected_message: selectedMessage || (messages.length > 0 ? messages[messages.length-1].message : ''),
                chat_history,
                participants: participantNames,
                interests
            });
            setIcebreaker(res.data.suggestion);
        } catch (err) {
            setIcebreaker('Could not fetch a suggestion. Try again!');
        }
        setIcebreakerLoading(false);
    };

    const handleStartBot = async () => {
        setShowBot(true);
        setBotMessages([]);
        setBotLoading(true);
        try {
            // Prepare chat history (last 10 messages, as text)
            const chat_history = messages.slice(-10).map(m => `${m.username}: ${m.message}`);
            const participantNames = Array.from(new Set(messages.map(m => m.username).concat([username])));
            const res = await axios.post(AI_SUGGEST_API_URL, {
                selected_message: messages.length > 0 ? messages[messages.length-1].message : '',
                chat_history,
                participants: participantNames,
                interests
            });
            setBotMessages([{ sender: 'bot', text: res.data.suggestion }]);
        } catch (err) {
            setBotMessages([{ sender: 'bot', text: 'Could not fetch a suggestion. Try again!' }]);
        }
        setBotLoading(false);
    };

    const handleBotSend = async () => {
        if (!botInput.trim()) return;
        const userMsg = { sender: 'user', text: botInput };
        setBotMessages(prev => [...prev, userMsg]);
        setBotLoading(true);
        try {
            // Prepare chat history for the bot (botMessages)
            const chat_history = botMessages.map(m => `${m.sender === 'user' ? username : 'Bot'}: ${m.text}`).concat([`${username}: ${botInput}`]);
            const participantNames = Array.from(new Set(messages.map(m => m.username).concat([username])));
            const res = await axios.post(AI_SUGGEST_API_URL, {
                selected_message: botInput,
                chat_history,
                participants: participantNames,
                interests
            });
            setBotMessages(prev => [...prev, { sender: 'bot', text: res.data.suggestion }]);
        } catch (err) {
            setBotMessages(prev => [...prev, { sender: 'bot', text: 'Could not generate a response.' }]);
        }
        setBotInput("");
        setBotLoading(false);
    };

    const handleSendBotMessageToChat = (msg) => {
        if (!msg) return;
        const messageData = {
            roomName: assignedRoom,
            username,
            message: msg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            senderSocketId: socketId,
        };
        socket.emit('sendInterestMessage', messageData);
    };

    function FuturisticSpinner({ type }) {
        let message = 'Generating icebreaker...';
        if (type === 'suggestion') {
            message = 'Generating conversation suggestion...';
        }
        return (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8}}>
                <div style={{
                    width: 48, height: 48, border: '5px solid #00b7ff44', borderTop: '5px solid #00b7ff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 8
                }} />
                <span style={{color:'#00b7ff',fontWeight:700,letterSpacing:1}}>{message}</span>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
            </div>
        );
    }

    const handleSendIcebreaker = () => {
        if (icebreaker) {
            const messageData = {
                roomName: assignedRoom,
                username,
                message: icebreaker,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                senderSocketId: socketId,
            };
            socket.emit('sendInterestMessage', messageData);
            setShowIcebreaker(false);
        }
    };

    // 1. Add a bot image (use a simple emoji or a local image if available)
    const BOT_IMAGE = '🤖'; // Replace with an <img> if you have a bot image asset
    // 2. Typewriter effect for bot response
    const [typingIndex, setTypingIndex] = useState(null);
    const [displayedBotText, setDisplayedBotText] = useState("");
    useEffect(() => {
        if (botMessages.length > 0 && botMessages[botMessages.length - 1].sender === 'bot') {
            const text = botMessages[botMessages.length - 1].text.replace(/^[A-Za-z0-9_\- ]+:\s*/g, '');
            setDisplayedBotText("");
            setTypingIndex(0);
            let idx = 0;
            const interval = setInterval(() => {
                setDisplayedBotText(text.slice(0, idx + 1));
                idx++;
                if (idx === text.length) {
                    clearInterval(interval);
                    setTypingIndex(null);
                }
            }, 25);
            return () => clearInterval(interval);
        }
    }, [botMessages]);

    // Flan chat handler
    const handleFlanSend = async () => {
        if (!flanInput.trim()) return;
        const userMsg = { sender: 'user', text: flanInput };
        setFlanMessages(prev => [...prev, userMsg]);
        setFlanLoading(true);
        try {
            const res = await axios.post(FLAN_CHAT_URL, { prompt: flanInput });
            setFlanMessages(prev => [...prev, { sender: 'flan', text: res.data.response }]);
        } catch (err) {
            setFlanMessages(prev => [...prev, { sender: 'flan', text: 'Could not generate a response.' }]);
        }
        setFlanInput("");
        setFlanLoading(false);
    };

    const fetchCompatibility = async () => {
      setCompatibilityLoading(true);
      setShowCompatibility(true);
      // Get all unique usernames except the current user
      const otherUsernames = Array.from(new Set(messages.map(m => m.username).filter(u => u !== username)));
      // For demo, use the same interests for both users if not available
      const user1_interests = interests;
      const user2_interests = interests; // You can enhance this if you store other users' interests
      const chat_history = messages.map(m => `${m.username}: ${m.message}`);
      try {
        const res = await axios.post(BACKEND_BASE_URL + '/api/compatibility-meter', {
          chat_history,
          user1_interests,
          user2_interests
        });
        setCompatibilityResult(res.data.result);
      } catch (err) {
        setCompatibilityResult('Could not generate a compatibility score.');
      }
      setCompatibilityLoading(false);
    };

    const handleLikeMessage = (msgId) => {
      const msg = messages.find(m => m.id === msgId);
      console.log('Double-clicked message:', msg); // Debug log
      if (!msg || msg.username === username) return; // Don't like your own message
      socket.emit('likeInterestMessage', { roomName: assignedRoom, msgId, username });
    };

    useEffect(() => {
      const likeHandler = ({ msgId, likes }) => {
        console.log('Received like update:', msgId, likes); // Debug log
        setMessages(prev =>
          prev.map((msg) =>
            msg.id === msgId ? { ...msg, likes } : msg
          )
        );
      };
      socket.on('interestMessageLiked', likeHandler);
      return () => {
        socket.off('interestMessageLiked', likeHandler);
      };
    }, [socket]);

    return (
        <>
            <div className="interest-chat-futuristic-bg" style={{minHeight:'100vh', width:'100vw', position:'relative', overflow:'hidden', background:'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)'}}>
                {/* Futuristic animated background overlay */}
                <div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:0, pointerEvents:'none'}}>
                    <svg width="100%" height="100%" style={{position:'absolute',top:0,left:0}}>
                        <defs>
                            <radialGradient id="glow1" cx="50%" cy="50%" r="80%">
                                <stop offset="0%" stopColor="#00b7ff99"/>
                                <stop offset="100%" stopColor="#0f202700"/>
                            </radialGradient>
                        </defs>
                        <circle cx="80%" cy="20%" r="400" fill="url(#glow1)"/>
                        <circle cx="20%" cy="80%" r="300" fill="url(#glow1)"/>
                    </svg>
                </div>
                {isSearching ? (
                    <div className="searching-container" style={{background:'transparent', zIndex:2}}>
                        <button onClick={() => navigate('/Home')} className="searching-back-button" style={{boxShadow:'0 0 16px #00b7ff88'}}>
                            ←
                        </button>
                        <div className="globe-background">
                            <Globe
                                ref={globeRef}
                                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                            />
                        </div>
                        <div className="searching-content" style={{backdropFilter:'blur(8px)', borderRadius:24, background:'rgba(0,183,255,0.07)', boxShadow:'0 8px 32px #00b7ff22', padding:'2.5rem 2rem', marginTop:40}}>
                            {!isMatchFound && (
                                <>
                                    <h2 style={{fontWeight:900, letterSpacing:2, color:'#00b7ff', textShadow:'0 0 16px #00b7ff88'}}>FINDING YOUR TRIBE...</h2>
                                    <p style={{color:'#fff', fontSize:18}}>Searching the digital universe for people who share your vibe.</p>
                                    {currentFact && (
                                        <div className="fun-fact" style={{marginTop:24, color:'#fff', fontStyle:'italic', fontSize:16, background:'rgba(0,183,255,0.09)', borderRadius:16, padding:'1rem 1.5rem', boxShadow:'0 0 12px #00b7ff33'}}>
                                            <p>💡 <em>{currentFact}</em></p>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {isMatchFound && (
                                <div className="match-found-popup">
                                    <div className="match-found-content">
                                        <div className="success-icon-container">
                                            <div className="success-icon-circle">
                                                <div className="success-icon-check"></div>
                                            </div>
                                        </div>
                                        <h3>User Found!</h3>
                                        <p>Connecting you to the room</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <header
                            className="interest-chat-header d-flex align-items-center justify-content-between px-5 py-4 flex-wrap"
                            style={{
                                backdropFilter: 'blur(10px)',
                                background: 'rgba(0,183,255,0.08)',
                                borderBottom: '1.5px solid #00b7ff55',
                                zIndex: 1000,
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                minHeight: 80,
                                gap: 16,
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.2rem 1.5rem',
                            }}
                        >
                            <div style={{flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 4}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            onClick={() => setShowAIDropdown(!showAIDropdown)}
                                            style={{
                                                background: 'linear-gradient(90deg, #00b7ff 0%, #2c5364 100%)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 16,
                                                padding: '0.6rem 1.6rem',
                                                fontWeight: 700,
                                                fontSize: 18,
                                                boxShadow: '0 0 12px #00b7ff33',
                                                cursor: 'pointer',
                                                letterSpacing: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                minWidth: 0,
                                                maxWidth: 220,
                                                height: 48,
                                                position: 'relative',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            AI <span role="img" aria-label="star">✨</span>
                                        </button>
                                        {showAIDropdown && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '110%',
                                                left: 0,
                                                background: '#fff',
                                                borderRadius: 12,
                                                boxShadow: '0 4px 24px #00b7ff33',
                                                minWidth: 200,
                                                zIndex: 100,
                                                padding: '0.5rem 0',
                                            }}>
                                                <div
                                                    style={{
                                                        padding: '0.7rem 1.2rem',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        color: '#0f2027',
                                                        borderBottom: '1px solid #e0e0e0',
                                                        transition: 'background 0.2s',
                                                    }}
                                                    onClick={() => {
                                                        setShowAIDropdown(false);
                                                        fetchIcebreaker();
                                                    }}
                                                >
                                                    Get an icebreaker
                                                </div>
                                                <div
                                                    style={{
                                                        padding: '0.7rem 1.2rem',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        color: '#0f2027',
                                                        borderBottom: '1px solid #e0e0e0',
                                                        transition: 'background 0.2s',
                                                    }}
                                                    onClick={() => {
                                                        setShowAIDropdown(false);
                                                        handleStartBot();
                                                    }}
                                                >
                                                    Get a conversation suggestion
                                                </div>
                                                <div
                                                    style={{
                                                        padding: '0.7rem 1.2rem',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        color: '#0f2027',
                                                        transition: 'background 0.2s',
                                                    }}
                                                    onClick={() => {
                                                        setShowAIDropdown(false);
                                                        setShowChatHistory(true);
                                                    }}
                                                >
                                                    Show chat history
                                                </div>
                                                <div
                                                    style={{
                                                        padding: '0.7rem 1.2rem',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        color: '#0f2027',
                                                        transition: 'background 0.2s',
                                                    }}
                                                    onClick={() => {
                                                        setShowAIDropdown(false);
                                                        setShowFlanChat(true);
                                                    }}
                                                >
                                                    Chat with Flan AI
                                                </div>
                                                <div
                                                    style={{
                                                        padding: '0.7rem 1.2rem',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        color: '#0f2027',
                                                        transition: 'background 0.2s',
                                                    }}
                                                    onClick={() => {
                                                        setShowAIDropdown(false);
                                                        fetchCompatibility();
                                                    }}
                                                >
                                                    Get compatibility meter
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className="chat-info text-nowrap"
                                        style={{ fontWeight: 700, color: '#fff', fontSize: 15, textShadow: '0 0 8px #00b7ff55' }}
                                    >
                                        {userCount} Online
                                    </div>
                                </div>
                                <h3
                                    className="mb-0"
                                    style={{
                                        color: '#00b7ff',
                                        fontWeight: 800,
                                        fontSize: '1.3rem',
                                        letterSpacing: 1.5,
                                        textShadow: '0 0 12px #00b7ff88',
                                        marginBottom: 0,
                                        wordBreak: 'break-word',
                                        marginTop: 12,
                                    }}
                                >
                                    Ready to spark a great conversation? Try an icebreaker or share something fun!
                                </h3>
                            </div>
                            <button
                                onClick={() => navigate('/Home')}
                                className="back-button"
                                style={{
                                    background: '#00b7ff',
                                    color: '#fff',
                                    fontWeight: 700,
                                    border: 'none',
                                    borderRadius: 18,
                                    padding: '0.6rem 2rem',
                                    fontSize: 18,
                                    boxShadow: '0 0 16px #00b7ff55',
                                    marginLeft: 'auto',
                                    marginRight: 0,
                                    position: 'relative',
                                    zIndex: 10,
                                    minWidth: 80,
                                    maxHeight: 48,
                                    alignSelf: 'flex-start',
                                }}
                                id="mobile-back-btn"
                            >
                                Back
                            </button>
                        </header>
                        <main
                            className="interest-chat-messages px-5 py-4"
                            style={{
                                flex: 1,
                                minHeight: 0,
                                background: 'transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 18,
                                overflowY: 'auto',
                                zIndex: 1,
                                marginBottom: 90, // leave space for fixed footer
                                marginTop: 120, // add space for fixed header
                            }}
                        >
                            {messages.map((msg, index) => {
                                const likes = msg.likes || [];
                                return (
                                    <div
                                        key={msg.id || index}
                                        className={`message open-message ${msg.username === username ? 'my-message' : 'other-message'}`}
                                        style={{
                                            alignSelf: msg.username === username ? 'flex-end' : 'flex-start',
                                            textAlign: msg.username === username ? 'right' : 'left',
                                            background: msg.username === username ? 'linear-gradient(90deg, #00b7ff55 0%, #2c5364 100%)' : 'linear-gradient(90deg, #232526 0%, #0f2027 100%)',
                                            color: '#fff',
                                            borderRadius: 22,
                                            padding: '1.1rem 2rem',
                                            maxWidth: '60vw',
                                            fontSize: 18,
                                            fontWeight: 500,
                                            boxShadow: msg.username === username ? '0 0 24px #00b7ff44' : '0 0 12px #00b7ff22',
                                            marginBottom: 2,
                                            border: msg.username === username ? '1.5px solid #00b7ff' : '1.5px solid #232526',
                                            backdropFilter: 'blur(2px)',
                                            transition: 'all 0.2s',
                                            letterSpacing: 0.2,
                                            marginLeft: msg.username === username ? 'auto' : 0,
                                            marginRight: msg.username === username ? 0 : 'auto',
                                            position: 'relative',
                                            cursor: 'pointer',
                                        }}
                                        onDoubleClick={() => handleLikeMessage(msg.id)}
                                    >
                                        <strong style={{ color: '#00b7ff', fontWeight: 700 }}>{msg.username}: </strong>{msg.message}
                                        {/* Debug: Always try to show the image and print the attachment object */}
                                        {msg.attachment && (
                                            <div style={{ marginTop: 8 }}>
                                                <div style={{ fontSize: 10, color: '#ff0', marginBottom: 4 }}>DEBUG: {JSON.stringify(msg.attachment)}</div>
                                                <img
                                                    src={msg.attachment.url}
                                                    alt={msg.attachment.name}
                                                    style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}
                                        <div style={{ color: '#bbb', fontSize: 13, marginTop: 6, textAlign: 'right' }}>
                                            {msg.timestamp && !isNaN(new Date(msg.timestamp)) &&
                                                new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            }
                                        </div>
                                        {likes.length > 0 && (
                                            <div style={{ color: '#ff4081', fontSize: 16, marginTop: 4, textAlign: 'right' }}>
                                                ❤️ {likes.length}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </main>
                        <footer
                            className="interest-chat-footer d-flex align-items-center px-3 py-3"
                            style={{
                                background: 'rgba(0,183,255,0.08)',
                                borderTop: '1.5px solid #00b7ff55',
                                zIndex: 100,
                                position: 'fixed',
                                left: 0,
                                bottom: 0,
                                width: '100vw',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 -2px 24px #00b7ff22',
                                minHeight: 70,
                                gap: 12,
                            }}
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="form-control me-2"
                                style={{
                                    borderRadius: 30,
                                    background: 'rgba(24,31,42,0.7)',
                                    color: '#fff',
                                    border: '1.5px solid #00b7ff',
                                    flex: 1,
                                    minWidth: 0,
                                    fontSize: 17,
                                    fontWeight: 500,
                                    boxShadow: '0 0 8px #00b7ff33',
                                    height: 44,
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                className="btn px-4 py-2"
                                style={{
                                    borderRadius: 30,
                                    fontWeight: 800,
                                    background: 'linear-gradient(90deg, #00b7ff 0%, #2c5364 100%)',
                                    border: 'none',
                                    fontSize: 19,
                                    color: '#fff',
                                    boxShadow: '0 0 16px #00b7ff55',
                                    minWidth: 90,
                                    height: 44,
                                }}
                            >
                                Send
                            </button>
                        </footer>
                    </>
                )}
            </div>
            {showIcebreaker && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10,20,40,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                }}>
                    <div style={{
                        minWidth: 300, maxWidth: 420, background: '#101c2c', borderRadius: 24, padding: 32, boxShadow: '0 8px 32px #00b7ff44', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
                    }}>
                        <h3 style={{color:'#00b7ff', marginBottom: 12, fontSize: 18, fontWeight: 700}}>
                            {interests && interests.length > 0
                                ? `Questions you can ask about ${interests.join(', ')}`
                                : 'AI Icebreaker'}
                        </h3>
                        {icebreakerLoading ? (
                            <FuturisticSpinner type={loadingType} />
                        ) : (
                            <>
                                <div style={{color:'#fff', fontSize:18, textAlign:'center', marginBottom: 12}}>{icebreaker}</div>
                                <div style={{display:'flex', gap:12}}>
                                    <button onClick={handleSendIcebreaker} style={{background:'#00b7ff', color:'#000', border:'none', borderRadius:16, padding:'0.6rem 1.5rem', fontWeight:700, fontSize:16, cursor:'pointer'}}>Send to chat</button>
                                    <button onClick={()=>setShowIcebreaker(false)} style={{background:'#222', color:'#fff', border:'none', borderRadius:16, padding:'0.6rem 1.5rem', fontWeight:700, fontSize:16, cursor:'pointer'}}>Close</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            {/* Bot UI at the top of chat */}
            {showBot && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', background: 'rgba(10,20,40,0.97)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '32px 0 0 0', minHeight: 320
                }}>
                    <div style={{ maxWidth: 500, width: '100%', background: '#101c2c', borderRadius: 24, padding: 24, boxShadow: '0 8px 32px #00b7ff44', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ color: '#00b7ff', fontWeight: 700, fontSize: 20, margin: 0 }}>WingmanAI</h3>
                            <button onClick={() => setShowBot(false)} style={{ background: 'none', color: '#fff', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ width: '100%', minHeight: 120, maxHeight: 220, overflowY: 'auto', background: '#182032', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                            {botMessages.map((msg, idx) => {
                                let displayText = msg.text.replace(/^[A-Za-z0-9_\- ]+:\s*/g, ''); // Remove leading 'Name: ' if present
                                return (
                                    <div key={idx} style={{
                                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                                        margin: '8px 0',
                                        color: msg.sender === 'user' ? '#00b7ff' : '#fff',
                                        fontWeight: msg.sender === 'user' ? 600 : 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    }}>
                                        {msg.sender === 'bot' && <span style={{ marginRight: 8, fontSize: 22 }}>{BOT_IMAGE}</span>}
                                        <span>
                                            {msg.sender === 'user'
                                                ? 'You: ' + displayText
                                                : (idx === botMessages.length - 1 && typingIndex !== null
                                                    ? displayedBotText
                                                    : displayText)}
                                        </span>
                                        {msg.sender === 'bot' && (
                                            <button onClick={() => handleSendBotMessageToChat(displayText)} style={{ marginLeft: 12, background: '#00b7ff', color: '#000', border: 'none', borderRadius: 8, padding: '2px 10px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Send to chat</button>
                                        )}
                                    </div>
                                );
                            })}
                            {botLoading && <div style={{ color: '#00b7ff', fontStyle: 'italic', marginTop: 8 }}>WingmanAI is thinking...</div>}
                        </div>
                        <div style={{ width: '100%', display: 'flex', gap: 8 }}>
                            <input
                                type="text"
                                value={botInput}
                                onChange={e => setBotInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleBotSend()}
                                placeholder="Ask WingmanAI a follow-up..."
                                style={{ flex: 1, borderRadius: 8, border: '1.5px solid #00b7ff', background: '#181f2a', color: '#fff', padding: '8px 12px', fontSize: 16 }}
                                disabled={botLoading}
                            />
                            <button onClick={handleBotSend} style={{ background: '#00b7ff', color: '#000', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} disabled={botLoading || !botInput.trim()}>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Chat History Modal */}
            {showChatHistory && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10,20,40,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                }}>
                    <div style={{
                        minWidth: 400, maxWidth: 600, maxHeight: '80vh', background: '#101c2c', borderRadius: 24, padding: 32, boxShadow: '0 8px 32px #00b7ff44', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, overflow: 'hidden',
                    }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{color:'#00b7ff', margin: 0, fontSize: 20, fontWeight: 700}}>Chat History</h3>
                            <button onClick={() => setShowChatHistory(false)} style={{ background: 'none', color: '#fff', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ 
                            width: '100%', 
                            flex: 1, 
                            overflowY: 'auto', 
                            background: '#182032', 
                            borderRadius: 12, 
                            padding: 16, 
                            border: '1px solid #00b7ff33',
                            maxHeight: '60vh'
                        }}>
                            {messages.length === 0 ? (
                                <div style={{ color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                <div style={{ color: '#fff', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                    {messages.map((msg, index) => (
                                        <div key={msg.id || index} style={{ marginBottom: 8 }}>
                                            <span style={{ color: '#00b7ff', fontWeight: 600 }}>{msg.username}</span>
                                            <span style={{ color: '#888', marginLeft: 8 }}>{msg.timestamp}</span>
                                            <br />
                                            <span style={{ color: '#fff', marginLeft: 16 }}>{msg.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            <button 
                                onClick={() => setShowChatHistory(false)} 
                                style={{
                                    background: '#222', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: 16, 
                                    padding: '0.6rem 1.5rem', 
                                    fontWeight: 700, 
                                    fontSize: 16, 
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showFlanChat && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10,20,40,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                }}>
                    <div style={{ minWidth: 400, maxWidth: 500, background: '#101c2c', borderRadius: 24, padding: 32, boxShadow: '0 8px 32px #00b7ff44', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, overflow: 'hidden' }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{color:'#00b7ff', margin: 0, fontSize: 20, fontWeight: 700}}>Flan AI Chat</h3>
                            <button onClick={() => setShowFlanChat(false)} style={{ background: 'none', color: '#fff', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ width: '100%', minHeight: 120, maxHeight: 220, overflowY: 'auto', background: '#182032', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                            {flanMessages.length === 0 ? (
                                <div style={{ color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
                                    Start chatting with Flan AI!
                                </div>
                            ) : (
                                flanMessages.map((msg, idx) => (
                                    <div key={idx} style={{
                                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                                        margin: '8px 0',
                                        color: msg.sender === 'user' ? '#00b7ff' : '#fff',
                                        fontWeight: msg.sender === 'user' ? 600 : 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    }}>
                                        {msg.sender === 'flan' && <span style={{ marginRight: 8, fontSize: 22 }}>🤖</span>}
                                        <span>
                                            {msg.sender === 'user' ? 'You: ' + msg.text : msg.text}
                                        </span>
                                    </div>
                                ))
                            )}
                            {flanLoading && <div style={{ color: '#00b7ff', fontStyle: 'italic', marginTop: 8 }}>Flan AI is thinking...</div>}
                        </div>
                        <div style={{ width: '100%', display: 'flex', gap: 8 }}>
                            <input
                                type="text"
                                value={flanInput}
                                onChange={e => setFlanInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleFlanSend()}
                                placeholder="Say something to Flan AI..."
                                style={{ flex: 1, borderRadius: 8, border: '1.5px solid #00b7ff', background: '#181f2a', color: '#fff', padding: '8px 12px', fontSize: 16 }}
                                disabled={flanLoading}
                            />
                            <button onClick={handleFlanSend} style={{ background: '#00b7ff', color: '#000', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }} disabled={flanLoading || !flanInput.trim()}>
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showCompatibility && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 18,
                        padding: '2.5rem 2rem',
                        minWidth: 320,
                        maxWidth: 420,
                        boxShadow: '0 8px 32px #00b7ff44',
                        textAlign: 'center',
                        position: 'relative',
                    }}>
                        <h2 style={{ color: '#00b7ff', fontWeight: 800, marginBottom: 18 }}>Compatibility Meter</h2>
                        {compatibilityLoading ? (
                            <div style={{ color: '#00b7ff', fontWeight: 600, fontSize: 18 }}>Calculating your vibe score...</div>
                        ) : (
                            <pre style={{ color: '#222', fontSize: 18, whiteSpace: 'pre-wrap', marginBottom: 18 }}>{compatibilityResult}</pre>
                        )}
                        <button
                            onClick={() => setShowCompatibility(false)}
                            style={{
                                background: '#00b7ff',
                                color: '#fff',
                                fontWeight: 700,
                                border: 'none',
                                borderRadius: 12,
                                padding: '0.7rem 2rem',
                                fontSize: 18,
                                boxShadow: '0 0 16px #00b7ff55',
                                marginTop: 10,
                                cursor: 'pointer',
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            <style>{`
            @media (max-width: 600px) {
                .interest-chat-header {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    padding: 1rem 0.7rem !important;
                    min-height: 90px !important;
                    gap: 8px !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    z-index: 1000 !important;
                }
                .interest-chat-header h3 {
                    font-size: 1.05rem !important;
                    letter-spacing: 0.5px !important;
                }
                .interest-chat-footer {
                    padding: 0.7rem 0.5rem !important;
                    min-height: 60px !important;
                }
                #mobile-back-btn {
                    position: absolute !important;
                    top: 10px !important;
                    right: 10px !important;
                    margin: 0 !important;
                    width: auto !important;
                    max-width: 100% !important;
                    min-width: 0 !important;
                    font-size: 16px !important;
                    padding: 0.5rem 0.9rem !important;
                    border-radius: 14px !important;
                    align-self: auto !important;
                }
                .interest-chat-messages {
                    padding-left: 0.5rem !important;
                    padding-right: 0.5rem !important;
                    margin-bottom: 70px !important;
                    margin-top: 120px !important;
                }
                .open-message {
                    max-width: 90vw !important;
                    font-size: 15px !important;
                    padding: 0.7rem 1rem !important;
                }
                .interest-chat-header button[style] {
                    font-size: 13px !important;
                    padding: 0.35rem 0.7rem !important;
                    border-radius: 9px !important;
                    min-width: 0 !important;
                    max-width: 120px !important;
                    height: 32px !important;
                }
            }
            .message.open-message.my-message {
                align-self: flex-end !important;
                text-align: right !important;
                margin-left: auto !important;
                margin-right: 0 !important;
            }
            .message.open-message.other-message {
                align-self: flex-start !important;
                text-align: left !important;
                margin-left: 0 !important;
                margin-right: auto !important;
            }
            `}</style>
        </>
    );
};

export default InterestChat; 