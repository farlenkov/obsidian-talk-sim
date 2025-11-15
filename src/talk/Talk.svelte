<script>

    import { getContext } from 'svelte';
    import { Play, RefreshCcw, ChevronLeft, ChevronRight, SquarePen, MessagesSquare, Copy, Volume2, Settings, Lightbulb } from 'lucide-svelte';
    import PlayButton from './PlayButton.svelte';
    import Message from './Message.svelte';
    
    const TAB_PROMPTS = "prompts";
    const TAB_MESSAGES = "messages";

    const appState = getContext("appState");

    let thinkSwitch = $state({});
    let enableAutoplay = $state(false);
    let mainTab = $state(TAB_PROMPTS);
    let currentThread = $state(appState.talk.getThread());
    let hasMessages = $derived(currentThread.length > 0);
    
    let inProgress = $derived(
        appState.textGenerator.inProgress ||
        appState.voiceGenerator.inProgress ||
        appState.voicePlayer.inProgress);

    let hasPrompts = $derived(
        appState.talk.sharedPrompt.trim() &&
        appState.talk.roles[0].prompt.trim() &&
        appState.talk.roles[1].prompt.trim());

    function onChange ()
    {
        appState.talk.OnChange();
    }

    async function clickGenerate(replaceMessage)
    {
        let newMessage = await appState.textGenerator.generateMessage(replaceMessage);
        currentThread = appState.talk.getThread();

        if (newMessage)
            if (mainTab != TAB_MESSAGES)
                mainTab = TAB_MESSAGES;

        while (enableAutoplay)
        {
            const audioClip = await appState.voiceGenerator.generateVoice(newMessage);
            appState.voicePlayer.playVoice(audioClip);

            if (enableAutoplay)
            {
                newMessage = await appState.textGenerator.generateMessage();
                currentThread = appState.talk.getThread();
            }
        }
    }

    function clickVariation(message, change)
    {
        let messagesByParent = appState.talk.messages[message.parentId];
        let currentVariation = appState.talk.VariantNum[message.id] - 1;
        let newVariation = currentVariation + change;

        if (newVariation < 0)
            newVariation = messagesByParent.length - 1;
        else if (newVariation >= messagesByParent.length)
            newVariation = 0;

        for (var i = 0; i < messagesByParent.length; i++)
            messagesByParent[i].isActive = (i == newVariation);
        
        appState.talk.OnChange();
        currentThread = appState.talk.getThread();
    }

    function clickCopy(message)
    {
        if (!navigator.clipboard)
            return;

        if (mainTab == TAB_PROMPTS)
        {
            const textToCopy =
                `<shared>\n${appState.talk.sharedPrompt}\n</shared>\n\n` +
                `<role1>\n${appState.talk.roles[0].prompt}\n</role1>\n\n` +
                `<role2>\n${appState.talk.roles[1].prompt}\n</role2>`;

            navigator.clipboard.writeText(textToCopy);
        }
        else
        {
            if (message)
            {
                const textToCopy = thinkSwitch[message.id] 
                    ? message.think 
                    : message.text;
                    
                navigator.clipboard.writeText(textToCopy);
            }
            else
            {
                let threadText = "Read aloud in a warm, welcoming tone\n\n";

                for (var i = 0; i < currentThread.length; i++)
                    threadText += `${i % 2 === 0 ? "Speaker 1:" : "Speaker 2:"} ${currentThread[i].text}\n\n`;

                navigator.clipboard.writeText(threadText);   
            }
        }
    }
    
    async function clickSpeak(message)
    {
        const audioClip = await appState.voiceGenerator.generateVoice(message);
        appState.voicePlayer.playVoice(audioClip);
    }

    function getRoleName(message)
    {
        const role = appState.talk.roles[message.role];
        return role.name || (message.role == 0 ? "<span style='font-size:0.6em'>➀</span> " : "<span style='font-size:0.6em'>➁</span> ") + message.model; 
        // https://www.w3schools.com/charsets/ref_utf_dingbats.asp
    }

</script>

<div class="main-menu">
    
    <div class="main-menu-left">
        <div 
            class="tappable"
            class:is-active={mainTab == TAB_PROMPTS}
            onclick={() => mainTab = TAB_PROMPTS}>

            <SquarePen size={16} />
            Prompts
        </div>

        {#if hasMessages}

            <div 
                class="tappable"
                class:is-active={mainTab == TAB_MESSAGES}
                onclick={() => mainTab = TAB_MESSAGES}>

                <MessagesSquare size={16} />
                Messages
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

    <div class="main-menu-right">

        <label 
            class="talk-autoplay"
            aria-label="Enable autoplay this conversation">
            <input 
                type="checkbox"
                bind:checked={enableAutoplay}> Autoplay
        </label>

        <button 
            class="clickable-icon"
            aria-label="{mainTab == TAB_PROMPTS ? "Copy all prompts" : "Copy all messages"}"
            onclick={() => clickCopy()}>
            <Copy size={16}/>
        </button>
        
        <button 
            type="button" 
            class="clickable-icon" 
            aria-label="Open node params" 
            onclick={() => appState.showSettings()}>
            <Settings size={16}/> 
        </button>

    </div>

</div>

{#if mainTab == TAB_PROMPTS}
    <div class="talk-prompts">
        <div class="prompt-shared">
            <div>
                <h4>Shared <dim>System Prompt</dim></h4>
            </div>
            
            <textarea 
                bind:value={appState.talk.sharedPrompt}
                onchange={onChange}>
            </textarea>
        </div>
        {#each appState.talk.roles as role, roleIndex}
            <div class="prompt-model">
                <div class="prompt-model-head">
                    <div>
                        <h4 aria-label="{role.model}">
                            {#if role.name}
                                {role.name}
                            {:else}
                                Model #{roleIndex + 1} <dim>Role Prompt</dim>
                            {/if}
                        </h4>
                    </div>
                    <div class="prompt-model-head-right">
                        <button 
                            type="button" 
                            class="clickable-icon" 
                            aria-label="Open node params" 
                            onclick={() => appState.roleParams.show(role, roleIndex)}>
                            <Settings size={16}/> 
                        </button>
                    </div>
                </div>
                
                <textarea 
                    bind:value={role.prompt}
                    onchange={onChange}></textarea>
            </div>
        {/each}
    </div>
{/if}

{#if mainTab == TAB_MESSAGES}
    <div class="talk-messages">
        <div class="talk-message-list">
            {#each currentThread as message, i}
                <div class="talk-message">
                    <div class="talk-message-head">
                        <div 
                            class="talk-message-role"
                            aria-label="{message.model}">
                            {@html getRoleName(message)}
                        </div>
                        <div class="talk-message-buttons">

                            {#if appState.talk.hasVariations(message.parentId)}
                                <div class="talk-message-variants">

                                    <button 
                                        class="clickable-icon"
                                        aria-label="Prev variation"
                                        onclick={() => clickVariation(message, -1)}>
                                        <ChevronLeft size={16}/>
                                    </button>

                                    {appState.talk.VariantNum[message.id]}
                                    / 
                                    {appState.talk.messages[message.parentId].length}

                                    <button 
                                        class="clickable-icon"
                                        aria-label="Next variation"
                                        onclick={() => clickVariation(message, 1)}>
                                        <ChevronRight size={16}/>
                                    </button>

                                </div>
                            {/if}

                            {#if message.think}
                                {#if !thinkSwitch[message.id]}
                                    <button 
                                        class="clickable-icon"
                                        aria-label="Show reasoning"
                                        onclick={() => thinkSwitch[message.id] = true}>
                                        <Lightbulb size={16}/>
                                    </button>
                                {:else}
                                    <button 
                                        style="color:var(--text-accent)"
                                        class="clickable-icon"
                                        aria-label="Show message"
                                        onclick={() => delete thinkSwitch[message.id]}>
                                        <Lightbulb size={16}/>
                                    </button>
                                {/if}
                            {/if}

                            <button 
                                class="clickable-icon"
                                aria-label="Copy message"
                                onclick={() => clickCopy(message)}>
                                <Copy size={16}/>
                            </button>

                            <PlayButton
                                inProgress={inProgress}
                                label1="Speak" 
                                label2="Speaking..." 
                                className="clickable-icon",
                                onclick={() => clickSpeak(message)}
                                Icon={Volume2} />

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
                        {#if !thinkSwitch[message.id]}
                            <Message markdown={message.text} />
                        {:else}
                            <Message markdown={message.think} />
                        {/if}
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