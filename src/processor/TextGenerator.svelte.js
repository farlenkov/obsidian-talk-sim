
import aiClient from '$lib/svelte-llm/models/AiClient.svelte';
import Processor from './Processor.svelte.js';

export default class TextGenerator extends Processor
{
    constructor (appState)
    {
        super(appState);
    }

    async generateMessage(replaceMessage)
    {
        try
        {
            this.inProgress = true;

            const lastParentId = replaceMessage ? replaceMessage.parentId : null;
            const tempThread = this.appState.talk.getThread(lastParentId);
            const roleIndex = tempThread.length % 2;
            const providerId = this.appState.talk.roles[roleIndex].provider;

            if (!this.appState.settings.HasKey(providerId))
            {
                this.appState.showSettings();
                this.inProgress = false;
                return;
            }

            if (!this.appState.settings.HasModels(providerId))
            {
                this.appState.roleParams.show(roleIndex);
                this.inProgress = false;
                return;
            }

            const isFirstRole = roleIndex === 0;
            const systemPrompt = `${this.appState.talk.sharedPrompt}\n\n${this.appState.talk.roles[roleIndex].prompt}`;

            const messages = []
            messages.push({ role : "user", content : [systemPrompt]});

            for (var i = 0; i < tempThread.length; i++)
            {
                const role = isFirstRole 
                    ? (i % 2 === 0 ? "model" : "user") 
                    : (i % 2 === 0 ? "user" : "model");

                messages.push
                ({ 
                    role : role, 
                    content : [tempThread[i].text[0]]
                });
            }

            const modelId = this.appState.talk.roles[roleIndex].model;
            const { markdowns } = await aiClient.Call(providerId, modelId, messages);
            
            const newMessage = 
            {  
                id : (new Date).getTime().toString(),
                text : markdowns.length == 1 ? [markdowns[0]] : [markdowns[1]],
                provider : providerId,
                model : modelId,
                role : isFirstRole ? 0 : 1,
                parentId : tempThread.length == 0 ? "" : tempThread[tempThread.length-1].id,
                isActive : true
            }

            this.appState.talk.addMessage(newMessage);
            this.inProgress = false;
            return newMessage;
        }
        catch(ex)
        {
            this.inProgress = false;
            throw ex;
        }
    }
}