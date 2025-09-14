import React, { useState } from 'react';
import { Loader } from './Loader';
import { DownloadIcon } from './icons/DownloadIcon';
import { EditIcon } from './icons/EditIcon';
import { ImageEditor } from './ImageEditor';

interface ResultDisplayProps {
  generatedImages: string[];
  isLoading: boolean;
  error: string | null;
  selectedImageIndex: number | null;
  onSelectImage: (index: number) => void;
}

const WelcomeMessage: React.FC = () => (
    <div className="text-center p-8">
        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700">Your VirtuShot Awaits</h3>
        <p className="text-gray-500 mt-2">Upload a product image and describe a scene to begin.</p>
    </div>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ generatedImages, isLoading, error, selectedImageIndex, onSelectImage }) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const handleDownload = () => {
    if (selectedImageIndex !== null && generatedImages[selectedImageIndex]) {
      const link = document.createElement('a');
      link.href = generatedImages[selectedImageIndex];
      link.download = `virtushot-product-shot-${selectedImageIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEdit = () => {
    if (selectedImageIndex !== null) {
      setIsEditorOpen(true);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
        <h3 className="font-bold">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (generatedImages.length > 0 && selectedImageIndex !== null) {
    const selectedImage = generatedImages[selectedImageIndex];
    return (
      <>
        {isEditorOpen && selectedImage && (
          <ImageEditor
            imageUrl={selectedImage}
            onClose={() => setIsEditorOpen(false)}
          />
        )}
        <div className="w-full h-full flex flex-col gap-4">
          <div className="flex-grow w-full h-full relative group min-h-0">
            <img
              src={selectedImage}
              alt={`VirtuShot Generated Product Shot ${selectedImageIndex + 1}`}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <EditIcon className="w-5 h-5" />
                Edit
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <DownloadIcon className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>
          {generatedImages.length > 1 && (
            <div className="flex-shrink-0">
              <h4 className="text-sm font-semibold text-gray-600 mb-2 text-center">Variations</h4>
              <div className="flex gap-2 justify-center flex-wrap">
                {generatedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectImage(index)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      index === selectedImageIndex ? 'border-indigo-500 scale-105 shadow-lg' : 'border-transparent hover:border-gray-400'
                    }`}
                    aria-label={`Select variation ${index + 1}`}
                  >
                    <img src={image} alt={`Variation ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return <WelcomeMessage />;
};