import TalkState from '$lib/talk/Talk.svelte.js';
import TextGenerator from '$lib/processor/TextGenerator.svelte.js';
import VoiceGenerator from '$lib/processor/VoiceGenerator.svelte.js';
import VoicePlayer from '$lib/processor/VoicePlayer.svelte.js';

import GenericModal from '$lib/svelte-obsidian/src/GenericModal.js';

import SettingsView from '$lib/svelte-llm/settings/Settings.svelte';
import settings from '$lib/svelte-llm/settings/Settings.svelte.js';

import providers from '$lib/svelte-llm/models/ProviderInfo.svelte.js';
import models from '$lib/svelte-llm/models/ModelInfo.svelte.js';

import ModelSelectState from '$lib/svelte-llm/settings/ModelSelect.svelte.js';
import RoleParams from '$lib/talk/RoleParams.svelte.js';

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
        this.textGenerator = new TextGenerator(this);
        this.voiceGenerator = new VoiceGenerator(this);
        this.voicePlayer = new VoicePlayer();
        this.modelSelectState = new ModelSelectState();
        this.roleParams = new RoleParams(this);
    }

    showSettings()
    {
        new GenericModal(this, SettingsView, ["talk-sim", "talk-sim-settings"]).open();
    }
}