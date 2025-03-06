import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import LetterGlitch from "./glitch";
import Swal from 'sweetalert2';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Auto-dismiss toast
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs before submitting
    if (!email || !password) {
      setToast({
        message: "Email and password are required!",
        type: "error",
      });
      return;
    }
    
    try {
      Swal.fire({
        title: 'Logging in...',
        text: 'Please wait',
        icon: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });
      
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password
      });
      
      Swal.close();
      
      // Store email for verification page
      localStorage.setItem('verificationEmail', email);
      
      if (!response.data.isVerified) {
        // User exists but needs verification
        Swal.fire({
          title: 'Account Found!',
          text: 'Your account needs verification. Redirecting to verification page...',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          navigate('/verify-email');
        }, 2000);
      } else {
        // User is already verified, store token and redirect to chat
        Swal.fire({
          title: 'Welcome back!',
          text: `Logged in as ${response.data.username}. Redirecting to tutorial...`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.username);
          navigate('/tutorial');
        }, 2000);
      }
      
    } catch (error) {
      Swal.close();
      
      if (error.response && error.response.status === 404) {
        // User doesn't exist
        Swal.fire({
          title: 'Account Not Found',
          text: 'Would you like to register?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, Register',
          cancelButtonText: 'No, Try Again'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/register');
          }
        });
      } else {
        // Other login errors
        Swal.fire({
          title: 'Login Failed',
          text: error.response?.data?.message || 'Invalid email or password!',
          icon: 'error'
        });
      }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

        /* Global Styles */
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          font-family: 'Poppins', sans-serif;
          background: #000;
          overflow: hidden;
        }

        .login-page {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
        }

        /* Glitch background covers full screen */
        .background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        /* Centered login container */
        .login-container {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 0 20px;
        }

        /* Glassmorphic login card */
        .login-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 40px 60px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
          color: #fff;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* Animated conic gradient overlay for extra flair */
        .login-card::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 180deg, #ff0000, #00ff00, #ff0000);
          opacity: 0.2;
          animation: spin 6s linear infinite;
          z-index: -1;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-card h2 {
          margin-bottom: 20px;
          font-weight: 600;
          font-size: 2.5rem;
          letter-spacing: 2px;
        }

        .login-input {
          width: 100%;
          margin-bottom: 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 8px;
          color: #fff;
          font-size: 1.1rem;
          padding: 12px;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .login-input:focus {
          border-color: #2575fc;
        }

        .login-button {
          width: 100%;
          padding: 14px;
          background: linear-gradient(90deg, #ff0000, #00ff00);
          border: none;
          border-radius: 25px;
          color: #fff;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .login-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(255, 0, 0, 0.5);
        }

        /* Toast Notification Style */
        .toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.85);
          color: #fff;
          padding: 20px 30px;
          border-radius: 8px;
          font-size: 1.5rem;
          font-weight: 600;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          z-index: 4;
          opacity: 0;
          animation: toastIn 0.5s forwards;
        }
        
        .toast.success {
          border-left: 5px solid #00ff00;
        }
        
        .toast.error {
          border-left: 5px solid #ff0000;
        }
        
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .register-link {
          margin-top: 20px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .register-link a {
          color: #ffffff;
          text-decoration: underline;
          transition: color 0.3s ease;
        }

        .register-link a:hover {
          color: #00ff00;
        }

        .forgot-password-link {
          margin-top: 10px;
          display: block;
        }
      `}</style>

      <div className="login-page">
        {/* LetterGlitch Background */}
        <div className="background">
          <LetterGlitch
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={false}
            smooth={true}
            glitchColors={["#ffffff", "#ff5555", "#55ff55", "#0000ff", "#ffff00"]}
          />
        </div>

        {/* Login Form */}
        <div className="login-container">
          <div className="login-card">
            <h2>Welcome Back</h2>
            <input
              type="email"
              className="login-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="login-button"
              onClick={handleSubmit}
            >
              Login
            </button>
            <div className="register-link">
              Don't have an account? <Link to="/register">Register</Link>
              <Link 
                to="/forgot-password" 
                className="forgot-password-link"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
      </div>
    </>
  );
}

export default Login;