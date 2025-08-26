import Processor from './Processor.svelte.js';

export default class VoicePlayer extends Processor
{
    playQueue = [];
    
    async playVoice(audioClip)
    {
        if (!audioClip)
            return;

        if (this.inProgress)
        {
            this.playQueue.push(audioClip);
            return;
        }
        
        this.inProgress = true;
        this.playQueue.push(audioClip);
        
        while (this.playQueue.length > 0)
        {
            const clipToPlay = this.playQueue[0];
            await clipToPlay.Play();

            this.playQueue.shift();
        }

        this.inProgress = false;
    }
}