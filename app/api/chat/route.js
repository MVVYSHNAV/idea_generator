import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN || process.env.HUGGING_FACE_API_KEY);

const MODE_PROMPTS = {
    brainstorm: `You are an expert creative strategist and brainstormer. Your goal is to expand the user's vision. 
    Suggest wildly creative ideas, adjacent markets, and unique twists. Don't worry about constraints yet—focus on high-energy innovation and "yes, and" thinking.`,

    mvp: `You are a lean startup expert focused on execution. Your goal is to strip the user's idea down to its most core, essential value proposition.
    Focus on the "Smallest Testable Product". Prioritize speed to market and identifying the single most important problem being solved.`,

    risk: `You are a critical thinker and risk analyst. Your goal is to kill the user's idea before the market does.
    Identify hidden assumptions, technical hurdles, market saturation, and potential failure points. Be brutally honest but constructive.`,

    roadmap: `You are an operations and project management lead. Your goal is to turn dreams into a phased plan.
    Structure output into clear, chronological phases: Research, Build, Launch, Scale. Focus on technical dependencies and clear milestones.
    CRITICAL: If the user asks to "generate roadmap" or "create plan", you MUST respond with a valid JSON object in this format:
    {
      "problem_statement": "string",
      "target_users": "string",
      "key_assumptions": ["string"],
      "mvp_features": ["string"],
      "roadmap_phases": [{"phase": "string", "tasks": ["string"]}],
      "risks": ["string"],
      "open_questions": ["string"]
    }
    Include NO other text before or after the JSON in this case.`,

    investor: `You are a venture capitalist and growth expert. Your goal is to find the "Big Business" in the idea.
    Focus on unit economics, defensibility (moats), scalability, and long-term exit potential. Address the "Why now?" and "How big?".`
};

export async function POST(req) {
    try {
        const { messages, selectedMode = 'brainstorm' } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Messages are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const systemPromptContent = MODE_PROMPTS[selectedMode] || MODE_PROMPTS.brainstorm;

        const systemPrompt = {
            role: 'system',
            content: `You are an expert co-founder and startup advisor strictly operating in ${selectedMode.toUpperCase()} mode. 
            ${systemPromptContent} 
            Keep responses concise, professional, and actionable.`
        };

        const response = await client.chatCompletion({
            model: "Qwen/Qwen3-Coder-480B-A35B-Instruct:together",
            messages: [systemPrompt, ...messages],
            max_tokens: 1000,
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
