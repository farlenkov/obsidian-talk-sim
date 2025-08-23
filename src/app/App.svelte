<script>

    import { setContext } from 'svelte';
    import Graph from '$lib/talk/Talk.svelte';    
    const { appState } = $props();
    setContext("appState", appState);

</script>

<Graph />
