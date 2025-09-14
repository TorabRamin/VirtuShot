import React, { useState, useCallback } from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { PromptInput } from '../components/PromptInput';
import { ResultDisplay } from '../components/ResultDisplay';
import { generateProductShot } from '../services/geminiService';
import { PurchaseCreditsModal } from '../components/client/PurchaseCreditsModal';
import { CreditCardIcon } from '../components/icons/CreditCardIcon';
import { updateClient } from '../auth/clientAuth';
import type { UploadedImage, ClientUser } from '../types';

interface ClientDashboardPageProps {
  client: ClientUser;
  setClient: (client: ClientUser) => void;
}

export const ClientDashboardPage: React.FC<ClientDashboardPageProps> = ({ client, setClient }) => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState<string>('On a white marble surface with soft, natural lighting.');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setUploadedImage(image);
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setError(null);
  }, []);

  const handlePurchaseCredits = (amount: number) => {
    const updatedClient = { ...client, credits: client.credits + amount };
    const result = updateClient(updatedClient);
    if (result) {
      setClient(result);
    }
    setIsPurchaseModalOpen(false);
  };

  const handleGenerate = useCallback(async (variationCount: number = 1, artisticStyle: string = 'photorealistic') => {
    if (!uploadedImage || !prompt) {
      setError('Please upload an image and enter a prompt.');
      return;
    }
    
    const requiredCredits = artisticStyle === 'all-styles-preview' ? 1 : variationCount;
    if (client.credits < requiredCredits) {
      setError(`Not enough credits. You need ${requiredCredits} for this generation.`);
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
        // Deduct credits
        const updatedClient = { ...client, credits: client.credits - requiredCredits };
        const result = updateClient(updatedClient);
        if (result) {
            setClient(result);
        }
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
  }, [uploadedImage, prompt, client, setClient]);

  return (
    <>
      {isPurchaseModalOpen && (
          <PurchaseCreditsModal 
            onClose={() => setIsPurchaseModalOpen(false)}
            onPurchase={handlePurchaseCredits}
            currentBalance={client.credits}
          />
      )}
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-6">
            <ImageUploader onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
            <div className="border-t border-gray-200 pt-6 flex flex-col gap-6">
                <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                onSubmit={handleGenerate}
                isLoading={isLoading}
                isImageUploaded={!!uploadedImage}
                credits={client.credits}
                />
                 <button 
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors"
                >
                    <CreditCardIcon className="w-5 h-5" />
                    Buy More Credits
                </button>
            </div>
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