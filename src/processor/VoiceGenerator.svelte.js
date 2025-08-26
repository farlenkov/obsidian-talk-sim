import aiClient from '$lib/svelte-llm/models/AiClient.svelte';
import Processor from './Processor.svelte.js';

export default class VoiceGenerator extends Processor
{
    async generateVoice(message)
    {
        if (!message)
            return;

        this.inProgress = true;

        const PROVIDER = "google";
        const MODEL = "gemini-2.5-flash-preview-tts";
        const voices = aiClient.GetVoices(PROVIDER);
        const voice = voices[Math.floor(Math.random() * voices.length)];
        console.log("voice", voice); // Schedar Sulafat Fenrir Callirrhoe

        const audioClip = await aiClient.Speak(PROVIDER, MODEL, voice, message.text[0]);
        
        this.inProgress = false;
        return audioClip;
    }
}