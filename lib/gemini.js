import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.gemini_api_key || process.env.Gemini_Api_Key;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateGeminiContent(systemPrompt, userPrompt, modelName = "gemini-1.5-flash") {
    if (!genAI) {
        console.warn("Gemini API Key not found. Please set GEMINI_API_KEY in .env.local");
        return null;
    }

    try {
        console.log(`Attempting Gemini generation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
            systemPrompt,
            userPrompt
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error(`Gemini Generation Error (${modelName}):`, error.message);

        // Fallback to gemini-pro if flash fails (e.g. not supported or other error)
        if (modelName !== "gemini-pro") {
            try {
                console.log("Falling back to gemini-pro...");
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
                const fallbackResult = await fallbackModel.generateContent([systemPrompt, userPrompt]);
                const fallbackResponse = await fallbackResult.response;
                return fallbackResponse.text();
            } catch (fallbackError) {
                console.error("Gemini Fallback (gemini-pro) Error:", fallbackError.message);
                return null;
            }
        }

        return null;
    }
}
