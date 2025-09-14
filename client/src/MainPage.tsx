

import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { ResultDisplay } from './components/ResultDisplay';
import { generateImage } from './services/apiService';
import type { UploadedImage } from './types';

interface MainPageProps {
  onNavigate: (page: 'clientSignup') => void;
  isAdmin?: boolean;
}

export const MainPage: React.FC<MainPageProps> = ({ onNavigate, isAdmin = false }) => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState<string>('On a white marble surface with soft, natural lighting.');
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setUploadedImage(image);
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setError(null);
  }, []);
  
  // Re-enabled generate handler for Admin
  const handleGenerate = useCallback(async (variationCount: number = 1, artisticStyle: string = 'photorealistic') => {
    if (!uploadedImage || !prompt) {
      setError('Please upload an image and enter a prompt.');
      return;
    }
    
    setIsLoading(true);
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setError(null);

    try {
      const results = [];
      for (let i = 0; i < variationCount; i++) {
          const result = await generateImage(uploadedImage.data, uploadedImage.type, prompt, artisticStyle);
          results.push(result.imageUrl);
      }
      
      if (results.length > 0) {
        setGeneratedImages(results);
        setSelectedImageIndex(0);
      } else {
        setError('The AI could not generate an image. Please try a different prompt or image.');
      }
    } catch (e) {
      console.error(e);
      setError(`Failed to generate image: ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, prompt]);

  return (
    <>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-6">
            <ImageUploader onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
            
            {isAdmin ? (
               <PromptInput
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onSubmit={handleGenerate}
                  isLoading={isLoading}
                  isImageUploaded={!!uploadedImage}
                  // credits is undefined for admin, enabling admin mode
                />
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg text-center p-4">
                    <h3 className="text-xl font-bold text-gray-800">Ready to Create?</h3>
                    <p className="text-gray-600 mt-2 mb-4">Sign up to get 10 free credits and generate your first AI photoshoot.</p>
                    <button 
                      onClick={() => onNavigate('clientSignup')}
                      className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Sign Up for Free
                    </button>
                </div>
                <PromptInput
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onSubmit={() => {}} // Guest submit does nothing
                  isLoading={false}
                  isImageUploaded={!!uploadedImage}
                  credits={0} // Guest users have 0 credits, disabling the button
                />
              </div>
            )}
          </div>

          {/* Result Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center min-h-[400px] lg:min-h-full">
            <ResultDisplay
              generatedImages={generatedImages}
              isLoading={isLoading}
              error={error}
              selectedImageIndex={selectedImageIndex}
              onSelectImage={setSelectedImageIndex}
            />
          </div>
        </div>
      </main>
    </>
  );
};