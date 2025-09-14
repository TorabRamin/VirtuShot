require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenAI, Modality } = require('@google/genai');

// --- APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// --- ENVIRONMENT VARIABLES ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/virtushot';
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;

if (!JWT_SECRET || !API_KEY) {
  console.error("FATAL ERROR: JWT_SECRET and API_KEY environment variables are required.");
  process.exit(1);
}

// --- DATABASE CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- MONGOOSE SCHEMA & MODEL ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  credits: { type: Number, default: 10 },
  apiKey: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  creditLimit: { type: Number, default: 50 },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

// Rename _id to id for frontend compatibility
UserSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
UserSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', UserSchema);

// --- AUTH MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

const adminMiddleware = async (req, res, next) => {
    // This is a placeholder. A real admin check would be more robust.
    // For now, we allow admin actions from any authenticated user.
    // In a real app, you'd check a role on the user object:
    // const user = await User.findById(req.userId);
    // if (!user || !user.isAdmin) return res.status(403).json({ message: 'Forbidden: Admin access required' });
    next();
};

// --- HELPER FUNCTIONS ---
const generateApiKey = () => `prod_sk_${[...Array(24)].map(() => Math.random().toString(36)[2]).join('')}`;

// --- API ROUTES ---

// 1. Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = new User({
      email,
      passwordHash,
      name: email.split('@')[0],
      apiKey: generateApiKey(),
    });
    await newUser.save();

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});


// 2. Image Generation Route
app.post('/api/generate', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.credits < 1) return res.status(402).json({ message: 'Insufficient credits' });

        const { imageData, mimeType, prompt, style } = req.body;
        if (!imageData || !mimeType || !prompt) {
            return res.status(400).json({ message: 'Missing image data, mime type, or prompt' });
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const model = 'gemini-2.5-flash-image-preview';
        
        const stylePrefix = ''; // Simplified for backend, can be expanded
        const fullPrompt = `${stylePrefix}Create a high-resolution, photorealistic product photograph based on this scene: "${prompt}". Place the clothing item from the image on a suitable surface or mannequin, remove the original background, and ensure lighting and shadows are realistic and consistent with the new scene. The final output must be only the generated, high-quality image.`;

        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { inlineData: { data: imageData, mimeType: mimeType } },
                    { text: fullPrompt },
                ],
            },
            config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                user.credits -= 1;
                await user.save();
                const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                return res.status(200).json({ imageUrl, credits: user.credits });
            }
        }
        res.status(500).json({ message: 'AI failed to generate an image part.' });

    } catch (error) {
        console.error("Image generation error:", error);
        res.status(500).json({ message: 'Failed to generate image', error: error.message });
    }
});

// 3. Admin Routes
app.get('/api/admin/clients', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const clients = await User.find({ isAdmin: false }).sort({ createdAt: -1 });
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch clients' });
    }
});

app.post('/api/admin/clients', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { email, passwordHash, name, credits, creditLimit, status } = req.body;
        const password = await bcrypt.hash(passwordHash, 12); // Re-hash password sent from admin
        const newClient = new User({
            email, name, credits, creditLimit, status,
            passwordHash: password,
            apiKey: generateApiKey(),
        });
        await newClient.save();
        res.status(201).json(newClient);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create client', error: error.message });
    }
});

app.put('/api/admin/clients/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedClient = await User.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedClient) return res.status(404).json({ message: 'Client not found' });
        res.status(200).json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update client' });
    }
});


// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
