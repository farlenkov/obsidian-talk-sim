export default class Processor
{
    inProgress = $state(false);
    
    constructor (appState)
    {
        this.appState = appState;
    }
}