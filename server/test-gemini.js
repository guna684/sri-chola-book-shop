import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
    try {
        console.log("Using Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Not Loaded");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hello!");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("Gemini Error:", error.toString());
    }
}
testGemini();
