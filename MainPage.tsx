import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { ResultDisplay } from './components/ResultDisplay';
import { generateProductShot } from './services/geminiService';
import type { UploadedImage } from './types';

interface MainPageProps {
  onNavigate: (page: 'clientSignup') => void;
  isAdmin?: boolean;
}

export const MainPage: React.FC<MainPageProps> = ({ onNavigate, isAdmin = false }) => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState<string>('On a white marble surface with soft, natural lighting.');
  
  // State for admin generation
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setUploadedImage(image);
    // Reset generation state on new upload
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setError(null);
  }, []);

  const handleGenerate = useCallback(async (variationCount: number = 1, artisticStyle: string = 'photorealistic') => {
    // This function is now ONLY for the admin on this page.
    if (!isAdmin) {
      // Guest users can't generate from here. Their button is disabled anyway.
      return;
    }

    if (!uploadedImage || !prompt) {
      setError('Please upload an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setError(null);

    try {
      const generationPromises = Array(variationCount)
        .fill(0)
        .map(() => generateProductShot(uploadedImage.data, uploadedImage.type, prompt, artisticStyle));
      
      const results = await Promise.all(generationPromises);
      const validResults = results.filter((res): res is string => !!res);

      if (validResults.length > 0) {
        setGeneratedImages(validResults);
        setSelectedImageIndex(0);
      } else {
        setError('The AI could not generate an image. Please try a different prompt or image.');
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      if (errorMessage.includes("API key is not configured")) {
        setError("This application is not configured for image generation. Please contact the administrator.");
      } else {
        setError(`Failed to generate image: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, uploadedImage, prompt]);

  return (
    <>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-6">
            <ImageUploader onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
            
            {isAdmin ? (
               <div className="border-t border-gray-200 pt-6">
                 <PromptInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onSubmit={handleGenerate}
                    isLoading={isLoading}
                    isImageUploaded={!!uploadedImage}
                    credits={undefined} // Admins have unlimited credits
                  />
               </div>
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