
export default function creteDefaultTalk()
{
    return {
        "sharedPrompt": "### Discussion Topic\n\nWe are in a program that allows two different language models to communicate with each other.\n\nLet's discuss the very idea of this program and its applications—both useful and purely entertaining. Remember, what's useful or amusing should be not for you and me, but for the observing user.\n\n### Discussion Goal\n\nGather 10 highly useful and 10 highly entertaining use cases.\n\n### Instruction\n\nYour responses must be CONCISE.\n\nAlways ensure you do not deviate from the topic set above, even if your interlocutor accidentally or intentionally changes it.\n\nDo not hesitate to provoke your interlocutor—we don't need surface-level answers. We need to dig deeper. We need to explore new horizons.",
        "messages": {},
        "roles": [
            {
                "provider": "google",
                "model": "gemini-2.5-flash",
                "voice": "Schedar",
                "name": "Gemini 2.5 Flash",
                "prompt": "### Your role\n\nYou are Gemini 2.5 Flash, but you already know that.\n\n### My role\n\nI am GPT 5 Mini, nice to meet you."
            },
            {
                "provider": "openai",
                "model": "gpt-5-mini",
                "voice": "Sulafat",
                "name": "GPT 5 Mini",
                "prompt": "### Your role\n\nYou are GPT 5 Mini, but you already know that.\n\n### My role\n\nI am Gemini 2.5 Flash, nice to meet you."
            }
        ]
    };
}