import { TextFileView } from 'obsidian';
import { mount, unmount } from 'svelte'

import App from '$lib/app/App.svelte';
import AppState from '$lib/app/App.svelte.js';

export default class TalkView extends TextFileView  
{
    constructor(leaf, plugin) 
    {
        super(leaf);
        this.plugin = plugin;
        this.appState = new AppState();
        this.appState.talk.OnChange = () => this.requestSave();
        this.appState.app = plugin.app;
    }

    getViewType() 
    {
        return 'talk-sim-view';
    }

    async setViewData (fileContents, clear)
    {
        const talkJson = JSON.parse(fileContents);
        await this.appState.talk.LoadFromFile(talkJson);

        if (this.talkView)
        {
            unmount(this.talkView);
            delete this.talkView;
        }
        
        const viewRoot = this.contentEl;
        viewRoot.classList.add('talk-sim');
        viewRoot.empty();

        this.talkView = mount(App, 
        { 
            target: viewRoot, 
            props : { appState : this.appState } 
        });
    }

    getViewData ()
    {
        return this.appState.talk.ToString();
    }

    clear ()
    {
        if (this.talkView)
        {
            unmount(this.talkView);
            delete this.talkView;
        }

        const viewRoot = this.contentEl;
        viewRoot.classList.remove('talk-sim');
        viewRoot.empty();
    }
}