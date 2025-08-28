import aiClient from '$lib/svelte-llm/models/AiClient.svelte';
import Processor from './Processor.svelte.js';

export default class VoiceGenerator extends Processor
{
    constructor (appState)
    {
        super(appState);
    }

    async generateVoice(message)
    {
        if (!message)
            return;

        this.inProgress = true;

        const providerId = "google";
        const modelId = "gemini-2.5-flash-preview-tts";

        const role = this.appState.talk.roles[message.role];
        const audioClip = await aiClient.Speak(providerId, modelId, role.voice, message.text);
        
        this.inProgress = false;
        return audioClip;
    }
}