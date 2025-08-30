<script>

    import aiClient from '$lib/svelte-llm/models/AiClient.svelte';
    import ModelSelect from '$lib/svelte-llm/settings/ModelSelect.svelte';

    const { appState, modal } = $props();
    let voices = aiClient.GetVoices("google");

    function onModelSelected(model)
    {
        appState.roleParams.role.provider = model.providerId;
        appState.roleParams.role.model = model.id;
        appState.talk.OnChange();
    }

    function onChange()
    {
        appState.talk.OnChange();
    }

</script>

<div class="role-name">
    <div>
        <div class="vertical-tab-header-group-title">
            Role Name
        </div>
        <input 
            type="text"
            placeholder="Role name for Model #1"
            bind:value={appState.roleParams.role.name}
            onchange={onChange} />
    </div>
    <div>
        <div class="vertical-tab-header-group-title">
            Voice
        </div>
        <select bind:value={appState.roleParams.role.voice}>
            {#each voices as voice}
                <option 
                    selected={voice === appState.roleParams.role.voice ? 'selected' : ''} 
                    value={voice}
                    onchange={onChange}>
                    {voice}
                </option>
            {/each}
        </select>

    </div>
</div>

<div class="role-model">
    <div class="vertical-tab-header-group-title">
        Select Model
    </div>
    <ModelSelect
        onModelSelected={onModelSelected}
        onShowSettings={() => appState.showSettings()}
        modelSelectState={appState.modelSelectState} />
</div>

<style>
    
</style>