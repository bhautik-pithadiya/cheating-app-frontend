import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Cropper, RectangleStencil } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import './Webcam.css';
import 'webrtc-adapter';

const WebcamCropper = ({ switchToChat }) => {
  const webcamRef = useRef(null);
  const cropperRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        // Check if we're in a secure context
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          setError('Camera access requires HTTPS. Please use a secure connection.');
          return;
        }

        // Check for browser support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          // Fallback for older browsers
          navigator.mediaDevices = {};
          navigator.mediaDevices.getUserMedia = function(constraints) {
            const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            
            if (!getUserMedia) {
              return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            return new Promise((resolve, reject) => {
              getUserMedia.call(navigator, constraints, resolve, reject);
            });
          };
        }

        const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsMobile(isMobileDevice);

        // Get initial camera access with fallback options
        const constraints = {
          video: {
            facingMode: isMobileDevice ? 'environment' : 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };

        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          stream.getTracks().forEach(track => track.stop()); // Clean up the test stream
        } catch (err) {
          // If the first attempt fails, try with basic constraints
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
          basicStream.getTracks().forEach(track => track.stop());
        }

        // Get available video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter((d) => d.kind === 'videoinput');

        if (videoInputDevices.length > 0) {
          setVideoDevices(videoInputDevices);
          // For mobile, prefer the back camera initially
          if (isMobileDevice) {
            const backCamera = videoInputDevices.find(device => 
              device.label.toLowerCase().includes('back') || 
              device.label.toLowerCase().includes('rear')
            );
            setDeviceId(backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId);
            setFacingMode('environment');
          } else {
            setDeviceId(videoInputDevices[0].deviceId);
            setFacingMode('user');
          }
        } else {
          setError('No camera found on your device');
        }
      } catch (err) {
        console.error('Camera initialization error:', err);
        if (err.name === 'NotAllowedError') {
          setError('Camera access was denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera device found.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.');
        } else {
          setError(`Error accessing camera: ${err.message}`);
        }
      }
    };

    initializeCamera();
  }, []);

  const switchCamera = async () => {
    try {
      if (isMobile) {
        // For mobile devices, toggle between front and back cameras
        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);
        
        // Find the appropriate camera device
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter((d) => d.kind === 'videoinput');
        
        if (newFacingMode === 'environment') {
          const backCamera = videoInputDevices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear')
          );
          if (backCamera) {
            setDeviceId(backCamera.deviceId);
          }
        } else {
          const frontCamera = videoInputDevices.find(device => 
            device.label.toLowerCase().includes('front') || 
            device.label.toLowerCase().includes('user')
          );
          if (frontCamera) {
            setDeviceId(frontCamera.deviceId);
          }
        }
      } else {
        // For desktop, cycle through available cameras
        if (videoDevices.length <= 1) {
          console.log('No additional cameras found');
          return;
        }
        
        const currentIndex = videoDevices.findIndex(device => device.deviceId === deviceId);
        const nextIndex = (currentIndex + 1) % videoDevices.length;
        const nextDevice = videoDevices[nextIndex];
        setDeviceId(nextDevice.deviceId);
      }
      
      // Safely stop the current video track
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.srcObject) {
        const tracks = webcamRef.current.video.srcObject.getTracks();
        tracks.forEach(track => {
          if (track && typeof track.stop === 'function') {
            track.stop();
          }
        });
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      setError('Error switching camera: ' + error.message);
    }
  };

  const capture = () => {
    try {
      const screenshot = webcamRef.current.getScreenshot();
      setImageSrc(screenshot);
    } catch (error) {
      console.error('Error capturing image:', error);
      setError('Error capturing image: ' + error.message);
    }
  };

  const crop = () => {
    try {
      const canvas = cropperRef.current?.getCanvas();
      if (canvas) {
        setCroppedImage(canvas.toDataURL());
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('Error cropping image: ' + error.message);
    }
  };

  const uploadImage = async () => {
    try {
      const res = await fetch(croppedImage);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append('file', blob, 'cropped.jpg');

      const response = await fetch('http://35.225.50.125:8000/upload_image/', {
        method: 'POST',
        body: formData,
      });

      const text = await response.json();
      console.log('Server response:', text);

      let ocr_Text = text.ocr_text;

      const response2 = await fetch(`http://35.225.50.125:8000/answer_mcq/${ocr_Text}`, {
        method: 'POST',
      });

      const answer = await response2.json();
      console.log('answer is ', answer);

      sessionStorage.setItem('chatAnswer', JSON.stringify({ from: 'bot', text: answer.answer }));

      if (switchToChat) switchToChat();
    } catch (error) {
      console.error('Image upload failed:', error);
      setError('Error uploading image: ' + error.message);
    }
  };

  if (error) {
    return (
      <div className="camera_Wrapper">
        <div className="p-4 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Error</h3>
            <p className="text-gray-600">{error}</p>
            <div className="mt-4 space-y-2">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-4 py-2 rounded block w-full"
              >
                Retry
              </button>
              <p className="text-sm text-gray-500 mt-2">
                If you're using incognito mode, please:
                <br />1. Open Chrome in regular mode
                <br />2. Allow camera permissions
                <br />3. Try again
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="camera_Wrapper">
      <div className="p-4 space-y-4">
        {!imageSrc ? (
          <>
            <div className="webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded shadow"
                width={640}
                height={480}
                videoConstraints={{
                  deviceId: deviceId ? { exact: deviceId } : undefined,
                  width: { ideal: 640 },
                  height: { ideal: 480 },
                  facingMode: facingMode,
                  aspectRatio: 1.333333333
                }}
                playsInline
                forceScreenshotSourceSize
                onUserMediaError={(err) => {
                  console.error('Webcam error:', err);
                  if (err.name === 'NotAllowedError') {
                    setError('Camera access was denied. Please allow camera access in your browser settings.');
                  } else {
                    setError('Error accessing camera: ' + err.message);
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={capture} className="bg-blue-600 text-white px-4 py-2 rounded">
                Capture Image
              </button>
              <button 
                onClick={switchCamera} 
                className="bg-yellow-500 text-white px-4 py-2 rounded"
                title={isMobile ? "Switch between front and back cameras" : "Switch camera"}
              >
                {isMobile ? "Flip Camera" : "Switch Camera"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cropper-container">
              <Cropper
                ref={cropperRef}
                src={imageSrc}
                stencilComponent={RectangleStencil}
                className="cropper"
                imageRestriction="none"
                autoZoom
                style={{ height: 480, width: 640 }}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={crop} className="bg-green-600 text-white px-4 py-2 rounded">
                Crop
              </button>
              <button onClick={() => setImageSrc(null)} className="bg-gray-400 text-white px-4 py-2 rounded">
                Retake
              </button>
              {croppedImage && (
                <button onClick={uploadImage} className="bg-purple-600 text-white px-4 py-2 rounded">
                  Get Answer
                </button>
              )}
            </div>
          </>
        )}

        {croppedImage && (
          <div className="cropped-image-container">
            <h3 className="font-semibold text-lg">Cropped Image:</h3>
            <img 
              src={croppedImage} 
              alt="Cropped" 
              className="rounded mt-2 shadow" 
              style={{ maxWidth: '100%', height: 'auto' }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCropper;
