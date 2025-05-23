import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage'; // helper function below

const ImageCaptureCrop = () => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    setCroppedImage(croppedImage);
  }, [imageSrc, croppedAreaPixels]);

  return (
    <div className="p-4 space-y-4">
      {!imageSrc ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-xl shadow-md"
          />
          <button onClick={capture} className="bg-blue-500 text-white px-4 py-2 rounded">Capture</button>
        </>
      ) : (
        <>
          <div className="relative w-full h-96">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <button onClick={showCroppedImage} className="bg-green-500 text-white px-4 py-2 rounded">Crop</button>
        </>
      )}

      {croppedImage && (
        <div>
          <h2>Cropped Image:</h2>
          <img src={croppedImage} alt="Cropped" className="rounded shadow-md" />
        </div>
      )}
    </div>
  );
};

export default ImageCaptureCrop;
