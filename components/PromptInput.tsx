import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: (variationCount: number, artisticStyle: string) => void;
  isLoading: boolean;
  isImageUploaded: boolean;
  credits?: number; // Optional: for credit system integration
}

const examplePromptsByCategory = {
  "MINIMAL & STUDIO": [
    "On a white marble surface with soft, natural lighting.",
    "Against a seamless, neutral-colored backdrop (e.g., beige, light gray).",
    "On a simple geometric pedestal with a single, dramatic shadow.",
    "Clothing item on a mannequin in a minimalist studio.",
    "Close-up product shot on a textured concrete surface.",
    "Levitating product against a solid pastel background.",
    "On a floating minimalist shelf against a soft gray wall.",
    "Product displayed on a stack of clean, white geometric blocks.",
    "Shot on a reflective, glossy white surface creating a soft mirror image.",
    "Draped over a sleek, modern chair in a brightly lit studio."
  ],
  "OUTDOOR & NATURE": [
    "Hanging on a driftwood rack on a sandy beach at sunset.",
    "Laying on a moss-covered rock in a misty forest.",
    "In a field of tall grass during golden hour.",
    "Product placed on a flat stone by a clear, flowing stream.",
    "Hanging from a tree branch in a blooming garden.",
    "On a sun-drenched terracotta patio with tropical plants."
  ],
  "URBAN & STREET": [
    "Worn by a mannequin on a bustling city street with motion blur.",
    "Hanging against a graffiti-covered brick wall.",
    "Reflected in the window of a modern skyscraper.",
    "On the steps of a classic brownstone building.",
    "Displayed in a neon-lit alleyway at night."
  ],
  "COZY & RUSTIC": [
    "Folded neatly on a rustic wooden table next to a steaming cup of coffee.",
    "Draped over a cozy armchair by a crackling fireplace.",
    "On a chunky knit blanket with a book and reading glasses.",
    "Product shot on a wooden table with a mug and a pastry.",
    "On a windowsill with raindrops on the glass.",
    "Laid out on a rustic linen tablecloth with dried flowers."
  ],
  "CREATIVE & ABSTRACT": [
    "Floating against a dreamy, abstract pastel-colored background.",
    "Draped over an invisible mannequin with a surreal, cloudy backdrop.",
    "Partially submerged in colored water, creating ripples.",
    "Surrounded by mirrors creating infinite reflections.",
    "Product shot with dramatic, colorful smoke."
  ]
};

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading, isImageUploaded, credits }) => {
  const [variationCount, setVariationCount] = useState(1);
  const [artisticStyle, setArtisticStyle] = useState('photorealistic');
  const [activePrompt, setActivePrompt] = useState(prompt);

  const hasCredits = credits === undefined || credits > 0;
  const isGenerationDisabled = isLoading || !isImageUploaded || !hasCredits;

  useEffect(() => {
    if (prompt !== activePrompt) {
      setActivePrompt(''); // Deselect if user types manually
    }
  }, [prompt, activePrompt]);
  
  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setActivePrompt(example);
  };
  
  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = e.target.value;
    setArtisticStyle(newStyle);
    if (newStyle === 'all-styles-preview') {
      setVariationCount(1);
    }
  };

  const getButtonText = () => {
    if (!hasCredits && credits !== undefined) {
      return 'No Credits Remaining';
    }
    const isAllStylesMode = artisticStyle === 'all-styles-preview';
    const isAdmin = credits === undefined;

    if (isAllStylesMode) {
      return isAdmin ? 'Generate Style Preview' : 'Generate Style Preview (1 Credit)';
    }
    if (variationCount > 1) {
      return isAdmin ? `Generate ${variationCount} Variations` : `Generate ${variationCount} Variations (${variationCount} Credits)`;
    }
    return isAdmin ? 'Generate Photoshoot' : 'Generate Photoshoot (1 Credit)';
  };


  const requiredCredits = artisticStyle === 'all-styles-preview' ? 1 : variationCount;
  const canAffordGeneration = credits === undefined || credits >= requiredCredits;
  const finalIsDisabled = isLoading || !isImageUploaded || !canAffordGeneration;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">2. Describe Your Scene</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., On a minimalist wooden hanger against a clean, white wall."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 h-28 resize-none"
          disabled={isLoading}
        />
      </div>
      
      <div className="flex flex-col gap-4">
        {Object.entries(examplePromptsByCategory).map(([category, prompts]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(p)}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${
                    activePrompt === p
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label={`Use prompt: ${p}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label htmlFor="variations" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Variations
          </label>
          <select
            id="variations"
            value={artisticStyle === 'all-styles-preview' ? 1 : variationCount}
            onChange={(e) => setVariationCount(parseInt(e.target.value, 10))}
            disabled={isLoading || artisticStyle === 'all-styles-preview'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value={1}>1 Image</option>
            <option value={2}>2 Images</option>
            <option value={3}>3 Images</option>
            <option value={4}>4 Images</option>
          </select>
        </div>
        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
            Artistic Style
          </label>
          <select
            id="style"
            value={artisticStyle}
            onChange={handleStyleChange}
            disabled={isLoading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 bg-white"
          >
            <option value="photorealistic">Photorealistic</option>
            <option value="vintage">Vintage</option>
            <option value="minimalist">Minimalist</option>
            <option value="futuristic">Futuristic</option>
            <option value="dramatic">Dramatic</option>
            <option value="bohemian">Bohemian</option>
            <option value="all-styles-preview">All Styles Preview</option>
          </select>
        </div>
      </div>
      <button
        onClick={() => onSubmit(variationCount, artisticStyle)}
        disabled={finalIsDisabled}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            {getButtonText()}
          </>
        )}
      </button>
      {!canAffordGeneration && credits !== undefined && (
        <p className="text-center text-sm text-red-600">
          Not enough credits. This action requires {requiredCredits}, but you only have {credits}.
        </p>
      )}
    </div>
  );
};