const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Farm AI Backend is running'
  });
});

app.post('/analyze', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        error: 'Image is required'
      });
    }

    res.json({
      success: true,
      message: 'Image received successfully',
      analysis: {
        status: 'pending',
        note: 'AI medical analysis will be connected next.'
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Server error'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Farm AI Backend running on port ${PORT}`);
});
