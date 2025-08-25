<script>

    import { setContext } from 'svelte';
    import Talk from '$lib/talk/Talk.svelte';
    
    const { appState } = $props();
    setContext("appState", appState);

</script>

<Talk />
