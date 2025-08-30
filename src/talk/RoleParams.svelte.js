import GenericModal from '$lib/svelte-obsidian/src/GenericModal.js';
import RoleParamsView from './RoleParams.svelte';

export default class RoleParams
{
    constructor(appState)
    {
        this.appState = appState;
    }

    show (role) 
    {
        this.role = role;
        this.appState.modelSelectState.ModelID = role.model;
        this.appState.modelSelectState.ProviderID = role.provider;

        new GenericModal(
            this.appState, 
            RoleParamsView, 
            ["svelte-obsidian", "talk-sim", "role-params"])
            .open();
    }
}