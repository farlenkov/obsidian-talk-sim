
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

            const messages = []
            messages.push({ role : "user", content : [this.appState.talk.sharedPrompt]});
            messages.push({ role : "user", content : [this.appState.talk.roles[roleIndex].prompt]});

            for (var i = 0; i < tempThread.length; i++)
            {
                const role = roleIndex === 0 
                    ? (i % 2 === 0 ? "model" : "user") 
                    : (i % 2 === 0 ? "user" : "model");

                messages.push
                ({ 
                    role : role, 
                    content : [tempThread[i].text]
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
                role : roleIndex,
                parentId : tempThread.length == 0 ? "" : tempThread[tempThread.length-1].id,
                isActive : true
            }

            newMessage.text = markdowns[0];

            if (markdowns.length > 1)
                newMessage.think = markdowns[1];

            this.appState.talk.addMessage(newMessage);
            this.inProgress = false;
            return newMessage;
        }
        catch(ex)
        {
            this.inProgress = false;
            new Notice(ex);
            throw ex;
        }
    }
}