const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
const genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyAFJrDpvipCA3R7v1F5ypoRB5MKiEKKkvM'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Main smile analysis endpoint
app.post('/analyze-smile', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }

        console.log('Processing smile analysis for:', req.file.originalname);

        // Read the uploaded image
        const imageData = fs.readFileSync(req.file.path);
        const base64Image = imageData.toString('base64');

        // Step 1: Analyze the current smile
        console.log('Step 1: Analyzing current smile...');
        const analysisResult = await analyzeCurrentSmile(base64Image, req.file.mimetype);

        // Step 2: Generate ideal smile design
        console.log('Step 2: Generating ideal smile design...');
        const idealSmileResult = await generateIdealSmile(base64Image, req.file.mimetype, analysisResult);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Return results
        res.json({
            success: true,
            analysis: analysisResult,
            idealSmileImage: idealSmileResult,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in smile analysis:', error);
        
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// Function to analyze current smile
async function analyzeCurrentSmile(base64Image, mimeType) {
    const prompt = `As a professional dental aesthetics AI, analyze this close-up smile photo in detail. Format your response using clear headers and numbered points for easy reading.

## Dental Assessment

1. **Tooth alignment and positioning:** [Analyze the alignment and positioning of teeth]

2. **Spacing between teeth:** [Evaluate spacing, gaps, or crowding]

3. **Tooth color and whiteness level:** [Assess current tooth color and whiteness]

4. **Tooth shape and proportions:** [Examine tooth shapes and proportional relationships]

5. **Gum line symmetry and health appearance:** [Evaluate gum health and symmetry]

## Smile Characteristics

1. **Smile width and proportions:** [Analyze overall smile dimensions]

2. **Tooth visibility when smiling:** [Assess how much teeth show when smiling]

3. **Lip line and framing:** [Evaluate how lips frame the teeth]

4. **Overall smile symmetry:** [Assess bilateral symmetry]

## Professional Recommendations

1. **Priority improvements:** [List specific areas that could be enhanced]

2. **Expected outcomes:** [Describe potential results of improvements]

3. **Treatment considerations:** [Suggest possible approaches]

## Positive Aspects

1. **Current strengths:** [Highlight existing positive features]

2. **Well-aligned features:** [Note aspects that are already ideal]

Provide detailed, professional, and encouraging feedback. Be specific but supportive in your analysis.`;

    try {
        const response = await genai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Image
                    }
                }
            ]
        });

        return response.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error analyzing smile:', error);
        throw new Error('Failed to analyze smile');
    }
}

// Function to generate ideal smile design
async function generateIdealSmile(base64Image, mimeType, analysisText) {
    const prompt = `Based on this smile photo and the dental analysis provided, create an IDEAL SMILE DESIGN that represents the perfect version of this person's smile. 

ANALYSIS CONTEXT:
${analysisText}

DESIGN REQUIREMENTS:
- Maintain the person's natural facial structure and proportions
- Keep their authentic appearance while optimizing dental aesthetics
- Create perfectly aligned, proportioned teeth
- Achieve ideal tooth color (natural white, not artificially bright)
- Perfect gum line symmetry
- Optimal smile width and lip framing
- Natural, healthy appearance

IMPORTANT: Generate a photorealistic image that shows what this person's smile could look like with ideal dental aesthetics. The result should be natural-looking, professionally enhanced, and maintain their unique facial characteristics while showcasing perfect dental proportions and alignment.

Create the ideal smile design now.`;

    try {
        const response = await genai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Image
                    }
                }
            ]
        });

        // Extract image data from response
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }

        throw new Error('No image generated in response');
    } catch (error) {
        console.error('Error generating ideal smile:', error);
        throw new Error('Failed to generate ideal smile design');
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        model: 'gemini-2.5-flash-image-preview'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 10MB.'
            });
        }
    }
    
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🦷✨ Ideal Smile Designer server running on port ${PORT}`);
    console.log(`📱 Open your browser and go to: http://localhost:${PORT}`);
    console.log(`🚀 Ready to analyze smiles with Gemini 2.5 Flash!`);
});
