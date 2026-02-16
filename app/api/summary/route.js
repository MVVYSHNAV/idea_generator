import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN || process.env.HUGGING_FACE_API_KEY);

export async function POST(req) {
    try {
        const { idea, memory, roadmap } = await req.json();

        const systemPrompt = {
            role: 'system',
            content: `You are an expert executive consultant. Your task is to generate a professional, high-level project summary for a startup idea.
            
            RULES:
            - Professional, formal tone.
            - NO emojis.
            - NO chat-like conversational filler.
            - Use clear headings and bullet points.
            - Focus on clarity and strategic insight.
            - Format the response in Markdown.

            SECTIONS TO INCLUDE:
            1. Project Overview
            2. Problem Being Solved
            3. Target Users
            4. Chosen Approach
            5. MVP Scope
            6. Roadmap Overview
            7. Key Risks & Assumptions
            8. Next Action Steps`
        };

        const userContext = `
        Idea: ${idea}
        
        Project Memory (Decisions/Assumptions):
        Decisions: ${memory?.decisions?.join(', ') || 'None tracked'}
        Assumptions: ${memory?.assumptions?.join(', ') || 'None tracked'}
        Scope: ${memory?.scope?.join(', ') || 'None tracked'}

        Roadmap:
        ${roadmap ? JSON.stringify(roadmap) : 'No roadmap generated yet.'}
        `;

        const response = await client.chatCompletion({
            model: "Qwen/Qwen3-Coder-480B-A35B-Instruct:together",
            messages: [
                systemPrompt,
                { role: 'user', content: `Please generate the final project summary based on this data: ${userContext}` }
            ],
            max_tokens: 2000,
            temperature: 0.5,
        });

        if (!response || !response.choices || response.choices.length === 0) {
            throw new Error('Invalid response format from provider');
        }

        return new Response(JSON.stringify({ summary: response.choices[0].message.content }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Summary API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate summary', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
