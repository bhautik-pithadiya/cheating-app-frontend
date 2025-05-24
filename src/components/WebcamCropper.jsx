import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Cropper, RectangleStencil } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import './Webcam.css';

const WebcamCropper = ({ switchToChat }) => {
  const webcamRef = useRef(null);
  const cropperRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkIncognito = async () => {
      try {
        // Try to access storage in incognito
        const storage = window.localStorage;
        storage.setItem('test', 'test');
        storage.removeItem('test');
        return false;
      } catch (e) {
        return true;
      }
    };

    const initializeCamera = async () => {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
        setError('Camera not supported in this environment.');
        return;
      }
    
      try {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsMobile(isMobile);
    
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter((d) => d.kind === 'videoinput');
    
        if (videoInputDevices.length > 0) {
          setVideoDevices(videoInputDevices);
          setDeviceId(videoInputDevices[0].deviceId);
        } else {
          setError('No camera found on your device');
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError('Error accessing camera: ' + err.message);
      }
    };
    

    initializeCamera();
  }, []);

  const switchCamera = async () => {
    try {
      if (videoDevices.length <= 1) {
        console.log('No additional cameras found');
        return;
      }
      
      const currentIndex = videoDevices.findIndex(device => device.deviceId === deviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];
      console.log('Switching to camera:', nextDevice);
      
      setDeviceId(nextDevice.deviceId);
      
      if (webcamRef.current) {
        const track = webcamRef.current.video.srcObject.getTracks()[0];
        track.stop();
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
                  facingMode: isMobile ? { ideal: 'environment' } : { ideal: 'user' }

                }}
                playsInline
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
              {videoDevices.length > 1 && (
                <button onClick={switchCamera} className="bg-yellow-500 text-white px-4 py-2 rounded">
                  Switch Camera
                </button>
              )}
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
