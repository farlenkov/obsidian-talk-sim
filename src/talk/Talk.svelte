<script>

    import { getContext } from 'svelte';
    import { Play, RefreshCcw } from 'lucide-svelte';
    import { mdToHtml } from '$lib/svelte-obsidian/src/Markdown.js';
    import aiClient from '$lib/svelte-llm/models/AiClient.svelte.js';
    import PlayButton from './PlayButton.svelte';

    const appState = getContext("appState");
    const TAB_PROMPTS = "prompts";
    const TAB_SESSIONS = "sessions";

    let mainTab = $state(TAB_PROMPTS);
    let inProgress = $state(false);
    let currentThread = $state(appState.talk.GetThread());
    let hasMessages = $derived(currentThread.length > 0);

    let hasPrompts = $derived(
        appState.talk.sharedPrompt.trim() &&
        appState.talk.modelPrompt1.trim() &&
        appState.talk.modelPrompt2.trim());

    function onChange ()
    {
        appState.talk.OnChange();
    }

    async function clickGenerate(replaceMessage)
    {
        if (mainTab != TAB_SESSIONS)
            mainTab = TAB_SESSIONS;

        inProgress = true;

        const lastParentId = replaceMessage ? replaceMessage.parentId : "";
        const tempThread = appState.talk.GetThread(lastParentId);
        console.log("tempThread", tempThread);

        const isFirstModel = tempThread.length % 2 === 0;

        const systemPrompt = isFirstModel
            ? `${appState.talk.sharedPrompt}\n\n${appState.talk.modelPrompt1}`
            : `${appState.talk.sharedPrompt}\n\n${appState.talk.modelPrompt2}`;

        const messages = []
        messages.push({ role : "user", content : [systemPrompt]});

        for (var i = 0; i < tempThread.length; i++)
        {
            const role = isFirstModel 
                ? (i % 2 === 0 ? "model" : "user") 
                : (i % 2 === 0 ? "user" : "model");

            messages.push({ role : role, content : [tempThread[i].text[0]]});
        }

        const { markdowns } = await aiClient.Call("google", "gemini-2.0-flash", messages);
        
        const newMessage = 
        {  
            id : (new Date).getTime().toString(),
            text : markdowns,
            provider : "google",
            model : "gemini-2.0-flash",
            role : isFirstModel ? 0 : 1,
            parentId : tempThread.length == 0 ? "" : tempThread[tempThread.length-1].id,
            isActive : true
        }

        appState.talk.AddMessage(newMessage);
        currentThread = appState.talk.GetThread();
        inProgress = false;
    }

</script>

<div class="main-menu">
    <div 
        class="tappable"
        class:is-active={mainTab == TAB_PROMPTS}
        onclick={() => mainTab = TAB_PROMPTS}>
        Prompts
    </div>

    {#if hasMessages}

        <div 
            class="tappable"
            class:is-active={mainTab == TAB_SESSIONS}
            onclick={() => mainTab = TAB_SESSIONS}>
            Sessions
        </div>

    {:else}

        <div class="talk-start">
            {#if hasPrompts}
                <PlayButton
                    inProgress={inProgress}
                    label1="Generate" 
                    label2="Generating..." 
                    label3="START"
                    label4="GENERATING..."
                    className="mod-cta",
                    onclick={clickGenerate}
                    Icon={Play} />
            {:else}
                <div class="warning">
                    Please, fill all prompts to continue.
                </div>
            {/if}
        </div>

    {/if}

</div>

{#if mainTab == TAB_PROMPTS}
    <div class="talk-prompts">
        <div class="prompt-shared">
            <h4>Shared <dim>System Prompt</dim></h4>
            <textarea 
                bind:value={appState.talk.sharedPrompt}
                onchange={onChange}>
            </textarea>
        </div>
        <div class="prompt-model1">
            <h4>Model #1 <dim>Role Prompt</dim></h4>
            <textarea 
                bind:value={appState.talk.modelPrompt1}
                onchange={onChange}>
            </textarea>
        </div>
        <div class="prompt-model2">
            <h4>Model #2 <dim>Role Prompt</dim></h4>
            <textarea 
                bind:value={appState.talk.modelPrompt2}
                onchange={onChange}>
            </textarea>
        </div>
    </div>
{/if}

{#if mainTab == TAB_SESSIONS}
    <div class="talk-messages">
        <div class="talk-message-list">
            {#each currentThread as message, i}
                <div class="talk-message">
                    <div class="talk-message-head">
                        <div class="talk-message-role">
                            {i % 2 === 0 ? "Model 1" : "Model 2"}
                        </div>
                        <div class="talk-message-buttons">

                            <PlayButton
                                inProgress={inProgress}
                                label1="Regenarate" 
                                label2="Generating..." 
                                className="clickable-icon",
                                onclick={() => clickGenerate(message)}
                                Icon={RefreshCcw} />

                        </div>
                    </div>
                    <div class="talk-message-body">                        
                        {@html mdToHtml(message.text[0])}
                    </div>
                </div>
            {/each}

            <div class="talk-message-next">

                {#if hasMessages}
                    <PlayButton
                        inProgress={inProgress}
                        label1="Generate" 
                        label2="Generating..." 
                        label3="CONTINUE"
                        label4="GENERATING..."
                        className="mod-cta",
                        onclick={clickGenerate}
                        Icon={Play} />
                {/if}

            </div>
        </div>
    </div>
{/if}

<style>

    
</style>