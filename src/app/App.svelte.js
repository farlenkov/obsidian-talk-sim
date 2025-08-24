import TalkState from '$lib/talk/Talk.svelte.js';
import GenericModal from '$lib/svelte-obsidian/src/GenericModal.js';

import settings from '$lib/svelte-llm/settings/Settings.svelte.js';
import providers from '$lib/svelte-llm/models/ProviderInfo.svelte.js';
import models from '$lib/svelte-llm/models/ModelInfo.svelte.js';

export default class AppState
{
    constructor()
    {
        // GLOBAL

        this.settings = settings;
        this.providers = providers;
        this.models = models;

        // LOCAL

        this.talk = new TalkState();
    }

    ShowSettings()
    {
        new GenericModal(appState, SettingsView, ["talk-sim", "talk-sim-settings"]).open();
        this.settings.Show(this);
    }
}