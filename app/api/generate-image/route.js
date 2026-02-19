import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { prompt, style } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const enhancedPrompt = style && style !== 'Realistic' ? `${prompt}, in ${style} style` : prompt;
        console.log(`Generating image for prompt: ${enhancedPrompt}`);

        let imageUrl;

        // 1. PRIMARY: OpenRouter (if key exists)
        // OpenRouter supports some image models via OpenAI-compatible endpoint
        const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_PAI_KEY;
        if (openRouterKey) {
            try {
                console.log("Attempting Primary OpenRouter generation for Image...");
                const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${openRouterKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://idea-navigator.com",
                        "X-Title": "Idea Navigator"
                    },
                    body: JSON.stringify({
                        "model": "stabilityai/stable-diffusion-xl-base-1.0", // Common model on OpenRouter
                        "prompt": enhancedPrompt,
                        "n": 1,
                        "size": "1024x1024"
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data && data.data.length > 0 && data.data[0].url) {
                        // OpenRouter returns a URL usually. We might need to fetch it to convert to base64 if we want consistency,
                        // but returning the URL is often fine. However, to match previous behavior (data url), let's fetch it.
                        const imgUrl = data.data[0].url;
                        const imgResponse = await fetch(imgUrl);
                        const arrayBuffer = await imgResponse.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        const base64 = buffer.toString('base64');
                        imageUrl = `data:image/jpeg;base64,${base64}`;
                    }
                } else {
                    console.warn(`OpenRouter Image API failed status: ${response.status}`);
                }
            } catch (orError) {
                console.error("OpenRouter Image Generation Failed:", orError.message);
                // Continue to fallback
            }
        }

        // 2. SECONDARY: Pollinations.ai (Free, No Key)
        if (!imageUrl) {
            try {
                console.log("Attempting Secondary Pollinations generation...");
                const encodedPrompt = encodeURIComponent(enhancedPrompt);
                const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

                const response = await fetch(pollinationsUrl);
                if (!response.ok) {
                    throw new Error(`Pollinations API failed with status: ${response.status}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64 = buffer.toString('base64');
                imageUrl = `data:image/jpeg;base64,${base64}`;
            } catch (pollinationsError) {
                console.error("Pollinations Generation Failed:", pollinationsError.message);
            }
        }

        // 3. FALLBACK: Static Placeholder
        if (!imageUrl) {
            console.log("Using Fallback Static Image...");
            imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
            return NextResponse.json({
                imageUrl: imageUrl,
                warning: "Generated with fallback due to error."
            });
        }

        return NextResponse.json({ imageUrl: imageUrl });

    } catch (error) {
        console.error('Image Generation Fatal Error:', error);
        return NextResponse.json({
            imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
            warning: "System error during generation."
        });
    }
}
