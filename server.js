const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json({ limit: '50mb' })); // بڑی تصویروں کے لیے سائز بڑھا دیا ہے

// اپنا گوگل اے آئی (Gemini) کی یہاں لکھیں
const ai = new GoogleGenAI({ apiKey: 'YOUR_GEMINI_API_KEY' });

app.get('/', (req, res) => {
  res.json({ status: 'Online', message: 'Farm AI Backend running successfully' });
});

app.post('/analyze', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Base64 سے ہیڈر کا حصہ الگ کرنا (اگر موجود ہو)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Gemini ماڈل کو تصویر بھیجنا
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: 'image/jpeg',
          },
        },
        {
          text: 'اس تصویر کا تجزیہ کریں اور فارم کے حوالے سے تفصیلی معلومات دیں۔',
        },
      ],
    });

    res.json({ success: true, result: response.text });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
