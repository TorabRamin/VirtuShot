
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import type { UploadedImage } from '../types';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
  uploadedImage: UploadedImage | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImage }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = (e.target?.result as string).split(',')[1];
          onImageUpload({
            data: base64Data,
            type: file.type,
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }, [onImageUpload]);
  
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };


  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-700">1. Upload Your Product</h2>
      <div className="relative w-full">
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        <label
          htmlFor="image-upload"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center 
            cursor-pointer transition-colors duration-200 ease-in-out
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}
            ${uploadedImage ? 'p-2' : 'p-4'}
          `}
        >
          {uploadedImage ? (
            <div className="relative w-full h-full">
              <img
                src={`data:${uploadedImage.type};base64,${uploadedImage.data}`}
                alt="Uploaded product"
                className="w-full h-full object-contain rounded-md"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                <span className="text-white text-lg font-semibold">Change Image</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <UploadIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="font-semibold">
                <span className="text-indigo-500">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm">PNG, JPG, or WEBP</p>
            </div>
          )}
        </label>
      </div>
       {uploadedImage && (
        <p className="text-sm text-gray-500 text-center truncate">
          File: {uploadedImage.name}
        </p>
      )}
    </div>
  );
};
