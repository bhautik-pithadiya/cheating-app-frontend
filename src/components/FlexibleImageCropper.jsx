import React, { useRef, useState } from 'react';
import { Cropper, CircleStencil } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';

const FlexibleImageCropper = () => {
  const cropperRef = useRef(null);
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const handleFileChange = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = () => setImage(fileReader.result);
    fileReader.readAsDataURL(event.target.files[0]);
  };

  const crop = () => {
    const canvas = cropperRef.current.getCanvas();
    if (canvas) {
      setCroppedImage(canvas.toDataURL());
    }
  };

  return (
    <div className="space-y-4 p-4">
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {image && (
        <>
          <Cropper
            ref={cropperRef}
            src={image}
            stencilComponent={CircleStencil}
            className="cropper"
            stencilProps={{ aspectRatio: null }} // Free aspect ratio
            imageRestriction="none"
            transformImage
            autoZoom
            checkOrientation={false}
          />
          <button onClick={crop} className="bg-blue-500 text-white px-4 py-2 rounded">
            Crop
          </button>
        </>
      )}

      {croppedImage && (
        <div>
          <h3 className="text-lg font-semibold">Cropped Image:</h3>
          <img src={croppedImage} alt="Cropped" className="rounded shadow-md mt-2" />
        </div>
      )}
    </div>
  );
};

export default FlexibleImageCropper;
