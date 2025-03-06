import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import LetterGlitch from './glitch'; // Import the LetterGlitch component
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './EmailVerification.css';

// Add this near the top of the component, after the state declarations
const API_URL = 'http://localhost:5000';

function EmailVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Create refs for each OTP input
  const inputRefs = Array(6).fill(0).map(() => React.createRef());

  useEffect(() => {
    // Get email from localStorage
    const verificationEmail = localStorage.getItem('verificationEmail');
    if (!verificationEmail) {
      Swal.fire({
        title: 'Error',
        text: 'No email found. Redirecting to login page...',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        navigate('/login');
      });
      return;
    }
    
    setEmail(verificationEmail);
    
    Swal.fire({
      title: 'Sending Verification',
      text: 'Sending verification code to your email...',
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Request OTP when component mounts
    sendVerificationOTP(verificationEmail);
  }, [navigate]);
  
  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const sendVerificationOTP = async (emailToVerify) => {
    try {
      console.log('Requesting OTP for:', emailToVerify);
      
      const response = await axios.post(`${API_URL}/send-verification-otp`, { 
        email: emailToVerify 
      });
      
      console.log('OTP request response:', response.data);
      
      Swal.close();
      
      setToast({
        message: "Verification code sent to your email",
        type: "success",
      });
      
      // If we're in development mode and get the OTP in the response, pre-fill it
      if (response.data.otp) {
        console.log('Pre-filling OTP from response:', response.data.otp);
        const otpDigits = response.data.otp.split('');
        setOtp(otpDigits);
      }
      
      // Disable resend button for 60 seconds
      setResendDisabled(true);
      setCountdown(60);
    } catch (error) {
      Swal.close();
      
      console.error('Error requesting OTP:', error);
      
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || "Failed to send verification code",
        icon: 'error'
      });
      
      if (error.response?.status === 404) {
        // User not found, redirect to registration
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      }
    }
  };

  const handleResendOTP = () => {
    if (!resendDisabled) {
      Swal.fire({
        title: 'Resending Code',
        text: 'Sending a new verification code...',
        icon: 'info',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });
      
      sendVerificationOTP(email);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Create a new array with the updated value
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus to next input if value is entered
    if (value !== '' && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };
  
  // Handle backspace key
  const handleKeyDown = (index, e) => {
    // Move to previous input when backspace is pressed on an empty input
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };
  
  // Handle paste for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Check if pasted data is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus the last input
      inputRefs[5].current.focus();
    }
  };
  
  // Get combined OTP value
  const getOtpValue = () => otp.join('');

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    // Check if otp is an array (from multiple input boxes)
    if (Array.isArray(otp)) {
      // Convert array to string and check if it's empty
      const otpString = otp.join('');
      if (!otpString) {
        setError('Please enter the verification code');
        return;
      }
    } else if (!otp || (typeof otp === 'string' && !otp.trim())) {
      // Check if otp is empty string
      setError('Please enter the verification code');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Verifying OTP -', 'Email:', email, 'OTP:', otp);
      
      // Log the request details
      console.log('POST request to:', `${API_URL}/verify-otp`);
      
      // Prepare OTP value - handle both array and string formats
      const otpValue = Array.isArray(otp) ? otp.join('') : otp;
      console.log('Request payload:', { email, otp: otpValue });
      
      const response = await axios.post(`${API_URL}/verify-otp`, {
        email,
        otp: otpValue
      });
      
      console.log('Verification response:', response.data);
      
      // Store auth data if successful
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        localStorage.removeItem('verificationEmail'); // Clean up
        
        // Redirect to chat landing
        navigate('/TutorialPage');
      } else {
        setError('Verification successful, but no token received');
      }
      
    } catch (error) {
      console.error('OTP verification error:', error);
      
      // Log detailed error information
      if (error.response) {
        console.log('Error status:', error.response.status);
        console.log('Error data:', error.response.data);
        setError(error.response.data.message || 'Invalid verification code');
      } else if (error.request) {
        console.log('No response received:', error.request);
        setError('Server not responding. Please try again later.');
      } else {
        console.log('Error message:', error.message);
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a function to use the test OTP for easier debugging
  const useTestOTP = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Request a test OTP from the server
      const response = await axios.post(`${API_URL}/generate-test-otp`, { email });
      
      // If successful, update the OTP field
      if (response.data.otp) {
        // Handle both array and string cases
        if (Array.isArray(otp)) {
          const testOtp = response.data.otp.split('');
          setOtp(testOtp);
        } else {
          setOtp(response.data.otp);
        }
        setError('Test OTP has been applied (123456)');
      }
    } catch (error) {
      console.error('Error getting test OTP:', error);
      setError('Could not generate test OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-page">
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

      {/* Bootstrap Container */}
      <div className="container-fluid h-100">
        <div className="row h-100 justify-content-center align-items-center">
          <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-4">
            <div className="card verification-card">
              <div className="card-body">
                <h2 className="card-title text-center mb-3">Verify Email</h2>
                <p className="card-text text-center mb-4">
                  We've sent a verification code to<br/>
                  <strong>{email}</strong>
                </p>
                
                {/* OTP Input Boxes */}
                <div className="d-flex justify-content-center mb-4" onPaste={handlePaste}>
                  <div className="row gx-2 gx-sm-3 justify-content-center w-100">
                    {otp.map((digit, index) => (
                      <div className="col-2" key={index}>
                        <input
                          ref={inputRefs[index]}
                          className="form-control otp-input-box"
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          autoFocus={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="d-grid gap-2 mb-3">
                  <button
                    className="btn btn-primary verify-button"
                    onClick={handleVerifyOTP}
                  >
                    Verify
                  </button>
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={handleResendOTP}
                    disabled={resendDisabled}
                    className="btn btn-link resend-link"
                  >
                    {resendDisabled 
                      ? `Resend Code (${countdown}s)` 
                      : "Resend Verification Code"}
                  </button>
                  
                  <div className="mt-3 back-to-login">
                    <Link to="/login">Back to Login</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`position-fixed bottom-0 start-50 translate-middle-x mb-4 p-3 toast-container`}>
          <div className={`toast show ${toast.type}`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-body">{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailVerification; 