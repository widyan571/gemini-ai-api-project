const {GoogleGenerativeAI} = require('@google/generative-ai');
const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const upload = multer({dest : 'uploads/'});

app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
        temperature: 0
    }
});

app.post("/generate-text", async(req, res) => {
    try {
        const { prompt } = req.body;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        res.status(200).json({output: text});
    } catch(error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while generating text from image.' });
    }
})

app.post("/generate-from-image", upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const image = imageGenerativePart(req.file.path, req.file.mimetype);

        const result = await model.generateContent([prompt, image])
        const response = result.response;
        const text = response.text();

        res.status(200).json({ output: text });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while generating text from image.' });
    } finally {
        fs.unlinkSync(req.file.path);
    }
})

app.post("/generate-from-document", upload.single('document'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const document = imageGenerativePart(req.file.path, req.file.mimetype);
        
        const result = await model.generateContent([prompt, document])
        const response = result.response;
        const text = response.text();
        res.status(200).json({ output: text });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while generating text from document.' });
    } finally {
        fs.unlinkSync(req.file.path);
    }
})

app.post("/generate-from-audio", upload.single('audio'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const audio = imageGenerativePart(req.file.path, req.file.mimetype);

        const result = await model.generateContent([prompt, audio])
        const response = result.response;
        const text = response.text();
        res.status(200).json({ output: text });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while generating text from audio.' });
    } finally {
        fs.unlinkSync(req.file.path);
    }
})

const imageGenerativePart = (filePath, mimeType) => ({
    inlineData: {
        data: fs.readFileSync(filePath).toString('base64'),
        mimeType: mimeType
    }
})

app.listen(port, () => {    
    console.log(`Server is running on port ${port}`);
})