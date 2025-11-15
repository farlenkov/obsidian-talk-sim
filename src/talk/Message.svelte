<script>
    
    import { getContext, onMount } from 'svelte';
    import { MarkdownRenderer } from 'obsidian';

    const appState = getContext("appState");
    let { markdown } = $props();
    let bodyEl;

    onMount(async () => { renderHtml(); });

    $effect(() => { renderHtml(); });

    function renderHtml()
    {
        bodyEl.empty();

        MarkdownRenderer.render(
            appState.app, 
            markdown, 
            bodyEl, 
            appState.view.file.path, 
            appState.view);
    }

</script>

<div 
    class="display-contents" 
    bind:this={bodyEl}>
</div>