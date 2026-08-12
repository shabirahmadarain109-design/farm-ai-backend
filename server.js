const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(express.json({ limit: '50mb' }));

// ==========================================
// GEMINI AI
// ==========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


// ==========================================
// HOME / SERVER STATUS
// ==========================================

app.get('/', (req, res) => {
  res.json({
    status: 'Online',
    message: 'Naveed Farm AI Backend running successfully',
  });
});


// ==========================================
// MEDICAL SCANNER
// ==========================================

app.post('/analyze', async (req, res) => {

  try {

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required',
      });
    }

    const base64Data =
      image.replace(/^data:image\/\w+;base64,/, '');

    const imageBuffer =
      Buffer.from(base64Data, 'base64');

    const response =
      await ai.models.generateContent({

        model: 'gemini-3-flash-preview',

        contents: [

          {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: 'image/jpeg',
            },
          },

          {
            text: `
آپ Naveed Farm کے Veterinary AI Assistant ہیں۔

اس فارم جانور کی medical image کا تجزیہ کریں۔

Supported animals:
- Broiler
- Cattle
- Goat
- Sheep

جو چیزیں تصویر سے واضح طور پر نظر آئیں صرف انہی کے بارے میں بتائیں۔

جواب میں یہ معلومات دیں:

1. Animal / Species
2. Visible Signs
3. Possible Condition
4. Confidence Level
5. Possible Causes
6. Recommended Next Steps
7. Warning Signs

کسی دوا یا antibiotic کی حتمی prescription نہ دیں۔
اگر مسئلہ شدید ہو تو qualified veterinary doctor سے معائنہ کروانے کا مشورہ دیں۔

جواب آسان اور واضح زبان میں دیں۔
            `,
          },

        ],

      });

    res.json({
      success: true,
      result: response.text,
    });

  } catch (error) {

    console.error('Medical AI Error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

});


// ==========================================
// BILL SCANNER
// ==========================================

app.post('/analyze-bill', async (req, res) => {

  try {

    const { image } = req.body;

    if (!image) {

      return res.status(400).json({
        success: false,
        error: 'Bill image is required',
      });

    }

    const base64Data =
      image.replace(/^data:image\/\w+;base64,/, '');

    const imageBuffer =
      Buffer.from(base64Data, 'base64');


    const response =
      await ai.models.generateContent({

        model: 'gemini-3-flash-preview',

        contents: [

          {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: 'image/jpeg',
            },
          },

          {
            text: `
آپ Naveed Farm Finance کے Bill Scanner AI ہیں۔

اس تصویر میں موجود bill / receipt کو غور سے پڑھیں۔

خاص طور پر یہ معلومات تلاش کریں:

1. Shop / Vendor Name
2. Bill Date
3. Total Amount
4. Currency
5. Items
6. Farm Expense Category

Expense Category ان میں سے ایک منتخب کریں:

Feed Expense
Medicine Expense
Salary Expense
Electricity Expense
Diesel Expense
Maintenance Expense
Other Expense

سب سے اہم چیز BILL کا FINAL TOTAL ہے۔

اگر تصویر میں واضح طور پر "TOTAL", "GRAND TOTAL", "NET TOTAL", "AMOUNT DUE" یا اس کے برابر کوئی رقم موجود ہے تو اسی رقم کو totalAmount بنائیں۔

اگر مختلف item prices موجود ہوں تو ان کا حساب بھی چیک کریں، لیکن اگر bill پر واضح Final Total موجود ہو تو اسے ترجیح دیں۔

جواب صرف اس JSON format میں دیں:

{
  "success": true,
  "vendor": "Shop Name",
  "date": "Bill Date",
  "totalAmount": 0,
  "currency": "PKR",
  "category": "Medicine Expense",
  "items": [
    {
      "name": "Item Name",
      "quantity": 1,
      "price": 0
    }
  ],
  "note": "Short description"
}

اہم:
- totalAmount صرف number ہو، مثلاً 15000
- amount میں PKR یا Rs نہ لکھیں
- اگر total amount واضح نہیں ہے تو totalAmount کو 0 رکھیں
- کوئی اضافی text نہ دیں، صرف JSON دیں۔
            `,
          },

        ],

      });


    let resultText = response.text || '';

    // ======================================
    // CLEAN AI RESPONSE
    // ======================================

    resultText =
      resultText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();


    let billData;

    try {

      billData = JSON.parse(resultText);

    } catch (jsonError) {

      console.log(
        'Bill JSON Parse Error:',
        resultText
      );

      return res.json({

        success: false,

        error:
          'AI نے bill کا درست حساب نہیں پڑھا۔ براہ کرم صاف تصویر دوبارہ scan کریں۔',

        rawResult: resultText,

      });

    }


    // ======================================
    // NORMALIZE RESULT
    // ======================================

    const totalAmount =
      Number(billData.totalAmount) || 0;


    res.json({

      success: true,

      vendor:
        billData.vendor || 'Unknown Vendor',

      date:
        billData.date || 'Unknown Date',

      totalAmount:
        totalAmount,

      currency:
        billData.currency || 'PKR',

      category:
        billData.category || 'Other Expense',

      items:
        Array.isArray(billData.items)
          ? billData.items
          : [],

      note:
        billData.note || 'Bill Scanner Expense',

    });


  } catch (error) {

    console.error(
      'Bill Scanner AI Error:',
      error
    );

    res.status(500).json({

      success: false,

      error:
        error.message ||
        'Bill analysis failed',

    });

  }

});


// ==========================================
// SERVER
// ==========================================

const PORT =
  process.env.PORT || 10000;


app.listen(PORT, () => {

  console.log(
    `Naveed Farm AI Server running on port ${PORT}`
  );

});
