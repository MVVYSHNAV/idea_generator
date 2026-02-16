import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN || process.env.HUGGING_FACE_API_KEY);

export async function POST(req) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Messages are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const systemPrompt = {
            role: 'system',
            content: 'You are an expert co-founder and startup advisor. Your goal is to help the user navigate their business ideas, provide critical feedback, suggest growth strategies, and act as a supportive but realistic partner. Keep responses concise, professional, and actionable.'
        };

        const response = await client.chatCompletion({
            model: "Qwen/Qwen3-Coder-480B-A35B-Instruct:together",
            messages: [systemPrompt, ...messages],
            max_tokens: 800,
            temperature: 0.7,
        });

        if (!response || !response.choices || response.choices.length === 0) {
            throw new Error('Invalid response format from provider');
        }

        const reply = response.choices[0].message;

        return new Response(JSON.stringify(reply), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Chat API Error:', error);

        return new Response(JSON.stringify({
            error: 'Failed to process request',
            details: error.message,
            type: error.name
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
