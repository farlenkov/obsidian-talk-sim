<script>

    import { getContext } from 'svelte';
    import { Play, Loader } from 'lucide-svelte';
    import { mdToHtml } from '$lib/svelte-obsidian/src/Markdown.js';
    import aiClient from '$lib/svelte-llm/models/AiClient.svelte.js';

    const appState = getContext("appState");
    const TAB_PROMPTS = "prompts";
    const TAB_SESSIONS = "sessions";

    let mainTab = $state(TAB_PROMPTS);
    let inProgress = $state(false);
    
    function onChange ()
    {
        appState.talk.OnChange();
    }

    async function clickGenerate()
    {
        if (mainTab != TAB_SESSIONS)
            mainTab = TAB_SESSIONS;

        inProgress = true;
        const messages = [];
        const isFirstModel = appState.talk.messages.length % 2 === 0;

        messages.push({ role : "user", content : [appState.talk.sharedPrompt]});

        if (isFirstModel)
            messages.push({ role : "user", content : [appState.talk.modelPrompt1]});
        else
            messages.push({ role : "user", content : [appState.talk.modelPrompt2]});

        for (var i = 0; i < appState.talk.messages.length; i++)
        {
            const role = isFirstModel && i % 2 === 0 ? "model" : "user";
            messages.push({ role : role, content : [appState.talk.messages[i]]});
        }

        const { markdowns } = await aiClient.Call("google", "gemini-2.0-flash", messages);

        if (markdowns.length == 1)
            appState.talk.messages = [...appState.talk.messages, markdowns[0]]
        else
            appState.talk.messages = [...appState.talk.messages, markdowns[1]]

        appState.talk.OnChange();
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
    <div 
        class="tappable"
        class:is-active={mainTab == TAB_SESSIONS}
        onclick={() => mainTab = TAB_SESSIONS}>
        Sessions
    </div>
    {#if !inProgress}
        <button class="mod-cta" aria-label="Call LLM" onclick={clickGenerate}>
            <Play size={16}/>  
        </button>
    {:else}
        <button class="mod-cta" aria-label="In progress..." disabled>
            <Loader size={16} class="rotate"/> 
        </button>
    {/if}
</div>

{#if mainTab == TAB_PROMPTS}
    <div class="prompts">
        <div class="common-prompt">
            <h4>Shared System Prompt</h4>
            <textarea 
                bind:value={appState.talk.sharedPrompt}
                onchange={onChange}>
            </textarea>
        </div>
        <div class="model1-prompt">
            <h4>System Prompt for Model #1</h4>
            <textarea 
                bind:value={appState.talk.modelPrompt1}
                onchange={onChange}>
            </textarea>
        </div>
        <div class="model2-prompt">
            <h4>System Prompt for Model #2</h4>
            <textarea 
                bind:value={appState.talk.modelPrompt2}
                onchange={onChange}>
            </textarea>
        </div>
    </div>
{/if}

{#if mainTab == TAB_SESSIONS}
    <div class="talk-sessions">
        <div class="talk-messages">
            {#each appState.talk.messages as message, i}
                <div class="talk-message">
                    <h6 class="talk-message-role">{i % 2 === 0 ? "Model 1" : "Model 2"}</h6>
                    {@html mdToHtml(message)}
                </div>
            {/each}
        </div>
    </div>
{/if}

<style>

    .main-menu
    {
        display: flex;
        margin: 0 1em;
        
        background-color: var(--background-secondary);
        border-bottom: 1px solid var(--divider-color);
        /* border-radius: var(--radius-s); */

        .tappable
        {
            padding: 0.5em 1em;
            /* border-radius: var(--radius-s); */
        }

        .tappable:hover,
        .tappable.is-active
        {
            background-color: var(--background-modifier-hover);
        }
    }

    .prompts
    {
        display: flex;
        gap: 1em; 
        padding: 1em;
        height: 90%;

        h4 
        { 
            margin-top: 0.1em; 
            margin-bottom: 0.01em; 
        }        
    }

    .common-prompt,
    .model1-prompt,
    .model2-prompt
    {
        flex: 1;

        textarea
        {
            width: 100%;
            height: 100%;
            resize: none;
        }
    }

    .talk-sessions
    {
        padding: 1em;

        .talk-messages
        {
            display: flex;
            flex-direction: column;
            gap: 1em;

            .talk-message
            {
                background-color: var(--background-secondary);
                border: 1px solid var(--divider-color);
                border-radius: var(--radius-s);
                padding: 0 1em;

                .talk-message-role
                {
                    opacity: 0.5;
                }
            }
        }
    }

</style>