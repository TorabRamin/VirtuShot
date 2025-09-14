import React, { useState } from 'react';
import { CopyIcon } from '../icons/CopyIcon';

const CodeBlock: React.FC<{ code: string, language: string }> = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800 text-white rounded-lg relative">
            <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md">
                {copied ? <span className="text-xs px-1">Copied!</span> : <CopyIcon className="w-4 h-4" />}
            </button>
            <pre className="p-4 overflow-x-auto text-sm">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};

const phpCode = `
function generate_ai_product_photo( $base64_image, $mime_type, $prompt ) {
    $api_key = 'YOUR_CLIENT_API_KEY'; // Replace with your key from the dashboard
    $api_url = 'https://your-service.com/api/generate'; // The API endpoint

    $response = wp_remote_post( $api_url, [
        'method'    => 'POST',
        'headers'   => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type'  => 'application/json',
        ],
        'body'      => json_encode([
            'imageData' => $base64_image,
            'mimeType'  => $mime_type,
            'prompt'    => $prompt,
            'style'     => 'photorealistic', // or other styles
        ]),
        'timeout'   => 60, // Increase timeout for image generation
    ]);

    if ( is_wp_error( $response ) ) {
        return $response->get_error_message();
    }

    $body = wp_remote_retrieve_body( $response );
    $data = json_decode( $body, true );

    // Assuming the API returns JSON with a base64 image string: 
    // { "imageUrl": "data:image/png;base64,iVBORw0KGgo..." }
    return $data['imageUrl'] ?? 'Error: Could not retrieve image.';
}

// Example Usage:
// $base64 = base64_encode( file_get_contents( $image_path ) );
// $prompt = "On a white marble surface with soft, natural lighting.";
// $generated_image_src = generate_ai_product_photo( $base64, 'image/jpeg', $prompt );
// echo '<img src="' . esc_attr( $generated_image_src ) . '" alt="AI Generated Photo">';
`;

const jsCode = `
const generateAiProductPhoto = async (base64Image, mimeType, prompt) => {
    const apiKey = 'YOUR_CLIENT_API_KEY'; // Replace with your key from the dashboard
    const apiUrl = 'https://your-service.com/api/generate'; // The API endpoint

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${apiKey}\`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageData: base64Image,
                mimeType: mimeType,
                prompt: prompt,
                style: 'photorealistic', // or other styles
            }),
        });

        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        
        // Assuming the API returns JSON with a base64 image string:
        // { "imageUrl": "data:image/png;base64,iVBORw0KGgo..." }
        return data.imageUrl;

    } catch (error) {
        console.error("Error generating AI photo:", error);
        return null;
    }
};

// Example Usage:
// const prompt = "On a white marble surface with soft, natural lighting.";
// const base64 = "your_base64_encoded_image_string_here";
// const generatedImageSrc = await generateAiProductPhoto(base64, 'image/jpeg', prompt);
// if (generatedImageSrc) {
//     document.getElementById('my-image').src = generatedImageSrc;
// }
`;

export const ApiDocs: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Integration Docs</h1>
      <p className="text-gray-600 mb-6">Follow these instructions to integrate our AI photo generation into your application.</p>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">1. API Endpoint & Authentication</h2>
          <p className="text-gray-600 mb-2">
            Make a <code className="bg-gray-100 text-red-600 p-1 rounded-md text-sm">POST</code> request to the following endpoint. You must include your API Key in the <code className="bg-gray-100 text-red-600 p-1 rounded-md text-sm">Authorization</code> header as a Bearer token.
          </p>
          <div className="bg-gray-100 p-3 rounded-md text-sm font-mono border">
            POST https://your-service.com/api/generate
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">2. Request Body (JSON)</h2>
          <p className="text-gray-600 mb-2">Your request body must be a JSON object with the following fields:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 pl-2">
                <li><code className="font-semibold">imageData</code>: (string) Base64-encoded string of the product image.</li>
                <li><code className="font-semibold">mimeType</code>: (string) The MIME type of the image (e.g., "image/png", "image/jpeg").</li>
                <li><code className="font-semibold">prompt</code>: (string) The scene description for the photoshoot.</li>
                <li><code className="font-semibold">style</code>: (string, optional) The artistic style (e.g., "photorealistic", "vintage"). Defaults to "photorealistic".</li>
            </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">3. WordPress / PHP Example</h2>
          <p className="text-gray-600 mb-2">
            Here’s how you can call the API from your WordPress <code className="bg-gray-100 p-1 rounded-md text-sm">functions.php</code> file or a custom plugin using <code className="bg-gray-100 p-1 rounded-md text-sm">wp_remote_post</code>.
          </p>
          <CodeBlock code={phpCode} language="php" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">4. JavaScript (Fetch API) Example</h2>
           <p className="text-gray-600 mb-2">
            For client-side applications, you can use the Fetch API.
          </p>
          <CodeBlock code={jsCode} language="javascript" />
        </div>
      </div>
    </div>
  );
};
