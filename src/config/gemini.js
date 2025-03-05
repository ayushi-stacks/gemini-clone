import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = "AIzaSyBdp2fvU2QsAR3IrKsqTdpiNzda4EM5Gdk";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

async function run(prompt) {
    try {
        const chatSession = await model.startChat({
            generationConfig,
            history: [],
        });

        const result = await chatSession.sendMessage(prompt);
        if (result && result.response && typeof result.response.text === 'function') {
            return result.response.text();
        } else {
            console.error("Unexpected response structure:", result);
            return "Error: Invalid response structure";
        }
    } catch (error) {
        console.error("Error in run():", error);
        return "Error fetching response";
    }
}

export default run;