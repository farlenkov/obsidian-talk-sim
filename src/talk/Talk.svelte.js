export default class TalkState
{
    FileVersion = 1;
    VariantNum = {};

    constructor(file)
    {
        this.sharedPrompt = $state("");
        this.modelPrompt1 = $state("");
        this.modelPrompt2 = $state("");
        this.messages = $state({});
        this.roles = $state([]);

        this.OnChange = () => {};
    }

    async loadFromFile(json)
    {
        if (typeof json === 'string')
            json = JSON.parse(json);

        if (json.version !== this.FileVersion)
            this.upgrade(json);

        this.sharedPrompt = json.sharedPrompt || "";
        this.modelPrompt1 = json.modelPrompt1 || "";
        this.modelPrompt2 = json.modelPrompt2 || "";
        this.messages = json.messages || {};

        this.roles = json.roles || [
            {provider: "google", model: "gemini-2.5-flash", voice: "Schedar"},
            {provider: "google", model: "gemini-2.5-flash", voice: "Leda"}];
    }

    upgrade (json)
    {
        if (!json.version)
        {
            for (let parentId in json.messages)
            {
                const messagesByParent =  json.messages[parentId];

                for (let i = 0; i < messagesByParent.length; i++)
                {
                    const message = messagesByParent[i];
                    const text = message.text;

                    if (text.length > 1)
                    {
                        message.text = text[1];
                        message.think = text[0];
                    }
                    else
                    {
                        message.text = text[0];
                    }
                }
            }
        }

        json.version = this.FileVersion;
    }

    toString ()
    {
        const data = 
        {
            version : this.FileVersion,
            sharedPrompt : this.sharedPrompt,
            modelPrompt1 : this.modelPrompt1,
            modelPrompt2 : this.modelPrompt2,
            messages : this.messages,
            roles : this.roles
        };

        return JSON.stringify(data, null, '\t');
    }

    hasMessages(parentId)
    {
        const messagesByParent = this.messages[parentId || ""];

        if (!messagesByParent)
            return false;
        else
            return messagesByParent.length > 0;
    }

    hasVariations(parentId)
    {
        const messagesByParent = this.messages[parentId || ""];

        if (!messagesByParent)
            return false;
        else
            return messagesByParent.length > 1;
    }

    getThread(lastParentId)
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

    addMessage(newMessage)
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
}