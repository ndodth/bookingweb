import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function QRCodeScanner() {
  const location = useLocation(); // Use useLocation to get location object
  const [isScanned, setIsScanned] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [qrImage, setQrImage] = useState(null);
  
  const { bookingData } = location.state || {};
  const bookingId = bookingData?.bookingID;
  const time = bookingData?.time;
  console.log(bookingData)
  console.log(bookingId)
  console.log(time)

  const handleScan = () => {
    setIsScanned(true);
    setCountdown(60);
  };

  const handleClose = () => {
    setIsScanned(false);
    setCountdown(60);
  };

  // Countdown effect
  useEffect(() => {
    if (countdown === 0) return;

    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  // Format countdown time as mm:ss
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Fetch QR code image based on booking ID using Axios
  useEffect(() => {
    if (bookingId) {
      axios.get(`http://localhost:5020/getImageQr/${bookingId}`, { responseType: 'blob' })
        .then(response => {
          const imageUrl = URL.createObjectURL(response.data);
          setQrImage(imageUrl);
        })
        .catch(error => console.error("Error fetching QR code image:", error));
    }
  }, [bookingId]);

  return (
    <div className="container d-flex flex-column align-items-center mt-5">
      <h1 className="mb-4">Scan Here!</h1>

      <div className="position-relative">
        {/* Display QR Code */}
        {qrImage ? (
          <img
            src={qrImage}
            alt="QR Code"
            className="img-fluid"
            style={{ width: '600px', height: '600px', cursor: 'pointer' }}
            onClick={handleScan}
          />
        ) : (
          <p>Loading QR code...</p>
        )}

        {/* Success message when scanned */}
        {isScanned && (
          <div
            className="position-absolute d-flex align-items-center justify-content-center p-3"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#4CAF50',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: 'bold',
              width: '350px',
              height: '80px',
              zIndex: 2,
              fontSize: '24px',
            }}
          >
            <span>Successful!</span>

            {/* Close button */}
            <button
              className="btn"
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '20px',
                cursor: 'pointer',
              }}
              onClick={handleClose}
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Countdown Timer */}
      <div className="mt-3 p-2 bg-light rounded">
        <h4 style={{ fontSize: '20px' }}>เวลา: {time}</h4>
        <h4 style={{ fontSize: '20px' }}>แสกนเพื่อปลดล็อคห้อง ภายใน 5 นาที หลังจากเวลาเริ่มต้น</h4>
      </div>
    </div>
  );
}

export default QRCodeScanner;
