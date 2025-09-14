import React, { useCallback, useState } from "react";
import { ImageUploader } from "./components/ImageUploader";
import { PromptInput } from "./components/PromptInput";
import { ResultDisplay } from "./components/ResultDisplay";
import type { UploadedImage } from "./types";

interface MainPageProps {
  onNavigate: (page: "clientSignup") => void;
  isAdmin?: boolean;
}

export const MainPage: React.FC<MainPageProps> = ({
  onNavigate,
  isAdmin = false,
}) => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(
    null
  );
  const [prompt, setPrompt] = useState<string>(
    "On a white marble surface with soft, natural lighting."
  );

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((image: UploadedImage) => {
    setUploadedImage(image);
    setGeneratedImages([]);
    setSelectedImageIndex(null);
    setError(null);
  }, []);

  return (
    <>
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-6">
            <ImageUploader
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
            />

            {isAdmin ? (
              <div className="text-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <h3 className="text-lg font-bold text-indigo-800">
                  Admin Mode
                </h3>
                <p className="text-indigo-700 mt-2">
                  The AI generator on this page has been disabled to ensure
                  security.
                </p>
                <p className="text-indigo-700 mt-1">
                  To test the full, secure image generation workflow, please{" "}
                  <button
                    onClick={() => onNavigate("clientSignup")}
                    className="font-bold underline hover:text-indigo-900"
                  >
                    sign up for a free client account
                  </button>
                  .
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg text-center p-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Ready to Create?
                  </h3>
                  <p className="text-gray-600 mt-2 mb-4">
                    Sign up to get 10 free credits and generate your first AI
                    photoshoot.
                  </p>
                  <button
                    onClick={() => onNavigate("clientSignup")}
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
