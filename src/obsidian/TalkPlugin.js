import { Plugin } from 'obsidian';
import TalkView from './TalkView.js';
import creteDefaultTalk from '$lib/talk/Talk.default.js';
import settings from '$lib/svelte-llm/settings/Settings.svelte.js';

export default class TalkPlugin extends Plugin 
{
    async onload() 
    {
        settings.Init(this);
        this.registerTalkView();
        this.registerMenuItem();

        this.addRibbonIcon(
            'messages-square', 
            'Create new Talk Sim', 
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
                        item.setTitle('New Talk Sim')
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
        let counter = 0;
        let baseName = "Talk Sim"
        let filePath = `${folderPath}/${baseName}.talk-sim`;
        
        while (await this.app.vault.adapter.exists(filePath)) 
        {
            counter++;
            filePath = `${folderPath}/${baseName} ${counter}.talk-sim`;
        }

        const talk = creteDefaultTalk();

        const file = await this.app.vault.create(
            filePath, 
            JSON.stringify(talk, null, '\t'));

        const leaf = this.app.workspace.getLeaf();
        await leaf.openFile(file);
    }
}