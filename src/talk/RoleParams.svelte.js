import GenericModal from '$lib/svelte-obsidian/src/GenericModal.js';
import RoleParamsView from './RoleParams.svelte';

export default class RoleParams
{
    constructor(appState)
    {
        this.appState = appState;
    }

    show (roleKey) 
    {
        this.role = this.appState.talk.roles[roleKey];        
        this.appState.modelSelectState.ModelID = this.role.model;
        this.appState.modelSelectState.ProviderID = this.role.provider;

        new GenericModal(
            this.appState, 
            RoleParamsView, 
            ["svelte-obsidian", "talk-sim", "role-params"])
            .open();
    }
}