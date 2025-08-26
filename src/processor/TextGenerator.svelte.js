
import aiClient from '$lib/svelte-llm/models/AiClient.svelte';
import Processor from './Processor.svelte.js';

export default class TextGenerator extends Processor
{
    async generateMessage(talkState, replaceMessage)
    {
        this.inProgress = true;

        const PROVIDER = "google";
        const MODEL = "gemini-2.5-flash";

        const lastParentId = replaceMessage ? replaceMessage.parentId : null;
        const tempThread = talkState.getThread(lastParentId);
        const isFirstModel = tempThread.length % 2 === 0;

        const systemPrompt = isFirstModel
            ? `${talkState.sharedPrompt}\n\n${talkState.modelPrompt1}`
            : `${talkState.sharedPrompt}\n\n${talkState.modelPrompt2}`;

        const messages = []
        messages.push({ role : "user", content : [systemPrompt]});

        for (var i = 0; i < tempThread.length; i++)
        {
            const role = isFirstModel 
                ? (i % 2 === 0 ? "model" : "user") 
                : (i % 2 === 0 ? "user" : "model");

            messages.push
            ({ 
                role : role, 
                content : [tempThread[i].text[0]]
            });
        }

        const { markdowns } = await aiClient.Call(PROVIDER, MODEL, messages);
        
        const newMessage = 
        {  
            id : (new Date).getTime().toString(),
            text : markdowns.length == 1 ? [markdowns[0]] : [markdowns[1]],
            provider : PROVIDER,
            model : MODEL,
            role : isFirstModel ? 0 : 1,
            parentId : tempThread.length == 0 ? "" : tempThread[tempThread.length-1].id,
            isActive : true
        }

        talkState.addMessage(newMessage);
        this.inProgress = false;
        return newMessage;
    }
}