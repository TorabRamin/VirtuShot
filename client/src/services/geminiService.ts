import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

// This function will get the API client, using the key from environment variables.
const getGoogleAIClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    // If no key is found, throw a specific error.
    throw new Error("The Gemini API key is not configured in the application's environment. The administrator needs to set the API_KEY.");
  }
  
  return new GoogleGenAI({ apiKey });
};


const getStylePromptPrefix = (style: string): string => {
  switch (style.toLowerCase()) {
    case 'vintage':
      return 'Create a vintage-style photo. Apply a faded, warm color palette, and subtle film grain effect. ';
    case 'minimalist':
      return 'Create a minimalist product shot. Use clean lines, simple composition, and a neutral color palette. ';
    case 'futuristic':
      return 'Create a futuristic product shot. Incorporate sleek metallic surfaces, glowing neon lights, and holographic elements. The atmosphere should feel high-tech, clean, and inspired by cyberpunk or sci-fi aesthetics. ';
    case 'dramatic':
      return 'Create a dramatic product shot using high-contrast lighting (chiaroscuro). Emphasize deep, rich shadows and focused spotlights to create a moody, intense, and luxurious atmosphere. The composition should feel powerful and mysterious. ';
    case 'bohemian':
      return 'Create a bohemian-style product shot. Feature natural textures like macrame, rattan, and linen. Use a warm, earthy color palette and soft, sun-drenched natural light. The scene should feel relaxed, free-spirited, and artisanal, possibly with elements like pampas grass or dried flowers. ';
    case 'photorealistic':
    default:
      return '';
  }
};


export async function generateProductShot(
  base64ImageData: string,
  mimeType: string,
  userPrompt: string,
  artisticStyle: string
): Promise<string | null> {
  try {
    const ai = getGoogleAIClient(); // Get the client dynamically
    const model = 'gemini-2.5-flash-image-preview';
    let fullPrompt: string;

    if (artisticStyle === 'all-styles-preview') {
      fullPrompt = `Create a single, high-resolution image formatted as a 2x3 grid. Each of the six cells in the grid should showcase the provided clothing item in a different artistic style, based on the scene: "${userPrompt}". The styles to include are: Photorealistic, Vintage, Minimalist, Futuristic, Dramatic, and Bohemian. Each cell must be clearly and elegantly labeled with the name of its style. The final output must be only this single composite grid image, professionally presented.`;
    } else {
      const stylePrefix = getStylePromptPrefix(artisticStyle);
      fullPrompt = `${stylePrefix}Create a high-resolution, professional-grade product photograph. The image should be sharp, clear, and highly detailed. Take the clothing item from the provided image, meticulously remove its original background, and place it in a new, photorealistic product shot based on the following scene: "${userPrompt}". The clothing item must be the main focus. Pay close attention to preserving the texture and fine details of the fabric. Ensure the lighting on the clothing seamlessly integrates with the new scene for a professional look. The final output must be only the generated, high-quality image.`;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Find the image part in the response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating product shot:", error);
     // Re-throw the error to be handled by the caller, which can display a user-friendly message.
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred during image generation.");
  }
}