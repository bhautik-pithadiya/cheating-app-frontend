import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Cropper, RectangleStencil } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import './Webcam.css'
const WebcamCropper = ({ switchToChat }) => {
  const webcamRef = useRef(null);
  const cropperRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputDevices = devices.filter((device) => device.kind === 'videoinput');
      setVideoDevices(videoInputDevices);
      if (videoInputDevices.length > 0) {
        setDeviceId(videoInputDevices[0].deviceId);
      }
    });
  }, []);

  const switchCamera = () => {
  
      const currentIndex = videoDevices.findIndex((device) => device.deviceId === deviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      setDeviceId(videoDevices[nextIndex].deviceId);
    
  };

  const capture = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImageSrc(screenshot);
  };

  const crop = () => {
    const canvas = cropperRef.current?.getCanvas();
    if (canvas) {
      setCroppedImage(canvas.toDataURL());
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
    }
  };

  return (
    <div className="camera_Wrapper">
      <div className="p-4 space-y-4">
        {!imageSrc ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded shadow"
              width={640}
              height={480}
              videoConstraints={{ deviceId: deviceId ? { exact: deviceId } : undefined }}
            />
            <div className="flex gap-2">
              <button onClick={capture} className="bg-blue-600 text-white px-4 py-2 rounded">
                Capture Image
              </button>
       
                <button onClick={switchCamera} className="bg-yellow-500 text-white px-4 py-2 rounded">
                  Switch Camera
                </button>
            
            </div>
          </>
        ) : (
          <>
            <Cropper
              ref={cropperRef}
              src={imageSrc}
              stencilComponent={RectangleStencil}
              className="cropper"
              imageRestriction="none"
              autoZoom
              style={{ height: 480, width: 640 }}
            />
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
          <div>
            <h3 className="font-semibold text-lg">Cropped Image:</h3>
            <img src={croppedImage} alt="Cropped" className="rounded mt-2 shadow" />
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCropper;
