export default class TalkState
{
    constructor(file)
    {
        this.sharedPrompt = $state("");
        this.modelPrompt1 = $state("");
        this.modelPrompt2 = $state("");
        this.messages = $state.raw([]);
        this.OnChange = () => {};
    }

    async LoadFromFile(json)
    {
        if (typeof json === 'string')
            json = JSON.parse(json);

        this.sharedPrompt = json.sharedPrompt || "";
        this.modelPrompt1 = json.modelPrompt1 || "";
        this.modelPrompt2 = json.modelPrompt2 || "";
        this.messages = json.messages || [];
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