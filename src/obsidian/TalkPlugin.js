import { Plugin } from 'obsidian';
import TalkView from './TalkView.js';
import creteDefaultTalk from '$lib/talk/Talk.default.js';
import settings from '$lib/svelte-llm/settings/Settings.svelte.js';
import { createNewFile } from '$lib/svelte-obsidian/src/CreateNewFile.js';

export default class TalkPlugin extends Plugin 
{
    async onload() 
    {
        settings.Init(this);
        this.registerTalkView();
        this.registerMenuItem();

        this.addRibbonIcon(
            'messages-square', 
            'Create new talk sim', 
            () => { this.CreateNewTalk("/"); });
    }

    async onunload() 
    {
        
    }

    async registerTalkView()
    {
        this.registerExtensions(
            ['talk-sim'], 
            'talk-sim-view');

        this.registerView(
            'talk-sim-view',
            (leaf) => new TalkView(leaf, this));
    }

    async registerMenuItem()
    {
        const fileMenuEvent = this.app.workspace.on(
            'file-menu', 
            (menu, menuFile) => 
            {
                if (menuFile.extension === undefined) 
                { 
                    menu.addItem((item) => 
                    {
                        item.setTitle('New talk sim')
                            .setIcon('messages-square') 
                            .onClick(async () =>
                            {
                                this.CreateNewTalk(menuFile.path);
                            });
                    });
                }
            });

        this.registerEvent(fileMenuEvent);
    }

    async CreateNewTalk(folderPath)
    {
        const talk = creteDefaultTalk();
        const talkJson = JSON.stringify(talk, null, '\t');

        await createNewFile(
            this.app, 
            folderPath,
            "Talk Sim",
            "talk-sim",
            talkJson);
    }
}