import aiClient from '$lib/svelte-llm/models/AiClient.svelte.js';

export default class TalkState
{
    VariantNum = {};

    constructor(file)
    {
        this.sharedPrompt = $state("");
        this.modelPrompt1 = $state("");
        this.modelPrompt2 = $state("");
        this.messages = $state({});

        this.IsSpeaking = $state({});

        this.OnChange = () => {};
    }

    async LoadFromFile(json)
    {
        if (typeof json === 'string')
            json = JSON.parse(json);

        this.sharedPrompt = json.sharedPrompt || "";
        this.modelPrompt1 = json.modelPrompt1 || "";
        this.modelPrompt2 = json.modelPrompt2 || "";
        this.messages = json.messages || {};
    }

    GetThread(lastParentId)
    {
        let parentId = "";
        const thread = [];

        if (lastParentId === "")
            return thread;

        while (true)
        {
            const messagesByParent = this.messages[parentId];

            if (!messagesByParent)
                break;

            for (var i = 0; i < messagesByParent.length; i++)
            {
                const message = messagesByParent[i];

                if (message.isActive)
                {
                    this.VariantNum[message.id] = i + 1;
                    thread.push(message);
                    parentId = message.id;
                    break;
                }
            }

            if (parentId == lastParentId)
                break;
        }

        return thread;
    }

    async Generate(replaceMessage)
    {
        const PROVIDER = "google";
        const MODEL = "gemini-2.5-flash";

        const lastParentId = replaceMessage ? replaceMessage.parentId : "";
        const tempThread = this.GetThread(lastParentId);
        const isFirstModel = tempThread.length % 2 === 0;

        const systemPrompt = isFirstModel
            ? `${this.sharedPrompt}\n\n${this.modelPrompt1}`
            : `${this.sharedPrompt}\n\n${this.modelPrompt2}`;

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

        this.AddMessage(newMessage);
    }

    AddMessage(newMessage)
    {
        const messagesByParent = this.messages[newMessage.parentId];

        if (messagesByParent)
        {
            for (var i = 0; i < messagesByParent.length; i++)
                messagesByParent[i].isActive = false;

            messagesByParent.push(newMessage)
            this.messages[newMessage.parentId] = messagesByParent;
        }
        else
        {
            this.messages[newMessage.parentId] = [newMessage];
        }
        
        this.OnChange();
    }

    SpeakStart(messageId)
    {
        const isSpeaking = this.IsSpeaking;
        isSpeaking[messageId] = true;
        this.IsSpeaking = isSpeaking;
    }

    SpeakStop(messageId)
    {
        const isSpeaking = this.IsSpeaking;
        delete isSpeaking[messageId];
        this.IsSpeaking = isSpeaking;
    }

    ToString ()
    {
        const data = 
        {
            sharedPrompt : this.sharedPrompt,
            modelPrompt1 : this.modelPrompt1,
            modelPrompt2 : this.modelPrompt2,
            messages : this.messages
        };

        return JSON.stringify(data, null, '\t');
    }
}