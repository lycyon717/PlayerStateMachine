
class Main extends egret.DisplayObjectContainer {


    private loadingView: LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield: egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene(): void {
        var sky: egret.Bitmap = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        var stageW: number = this.stage.stageWidth;
        var stageH: number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        var man0:egret.Bitmap = this.createBitmapByName("S00_png");
        var man1:egret.Bitmap = this.createBitmapByName("S01_png");
        var man2:egret.Bitmap = this.createBitmapByName("S02_png");
        var man3:egret.Bitmap = this.createBitmapByName("S03_png");
        var man4:egret.Bitmap = this.createBitmapByName("R000_png");
        var man5:egret.Bitmap = this.createBitmapByName("R001_png");
        var man6:egret.Bitmap = this.createBitmapByName("R002_png");
        var man7:egret.Bitmap = this.createBitmapByName("R003_png");
        var man8:egret.Bitmap = this.createBitmapByName("R004_png");

        var man:egret.Bitmap[]=[man0,man1,man2,man3,man4,man5,man6,man7,man8];

        var rightCon = new egret.DisplayObjectContainer();
        rightCon.x=0;
        rightCon.y=0;
        this.addChild(rightCon);

        var Mach: Machine = new Machine(this,man,rightCon);
        Mach.Idel();
        
        sky.touchEnabled = true;
        sky.addEventListener(egret.TouchEvent.TOUCH_BEGIN,(e)=>{
            Mach.setstate(Mach.Running);
            Mach.RunState(e.stageX,e.stageY);
        },this)
    }

    private createBitmapByName(name: string): egret.Bitmap {
        var result = new egret.Bitmap();
        var texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}

interface State {
    Idel();
    ClickandRun(x:number,y:number);
}

class Machine {
    private state: State;
    public Standing: State;
    public Running: State;
    public man: egret.Bitmap[];
    public stage: any;
    public rongqi:egret.DisplayObjectContainer;
    private x:number;
    private y:number;

    public constructor(stage:any,man:egret.Bitmap[],rq:egret.DisplayObjectContainer) {
        this.rongqi = new egret.DisplayObjectContainer();
        this.rongqi = rq;
        this.man = man;
        this.Standing = new StandState(this);
        this.Running = new RunState(this);
        this.state = this.Standing;
        if (stage == null) {
            console.log("No picture import!")
        }
        
        this.stage = stage;
    }

    public Idel(): void {
        this.state.Idel();
    }
    public RunState(x:number,y:number): void {
        this.state.ClickandRun(x,y);
    }
    public setstate(state: State) {
        this.state = state;
    }
    public getstate(): State {
        return (this.state);
    }
}

class StandState implements State {
    private machine: Machine;
    private count: number;
    private timer: egret.Timer;

    public constructor(machine: Machine) {
        this.machine = machine;
        this.count = 0;
    }

    public Idel(): void {
        console.log("me");
        this.timer = new egret.Timer(100, 0);
        this.timer.addEventListener(egret.TimerEvent.TIMER, this.timerFunc, this);
        this.timer.start();
    }

    private timerFunc(event: egret.Event) {
        if(this.machine.rongqi.numChildren>0){
            this.machine.rongqi.removeChildAt(0);
        }
        this.machine.rongqi.addChild(this.machine.man[this.count]);
        this.count++;

        if(this.count>=3)
        {
            this.count=0;
        }
        if(this.machine.getstate()!=this){
            this.timer.stop();
        }
    }
    public ClickandRun(x:number,y:number): void {
        console.log("Exit Idel");
    }
}

class RunState implements State {
    private machine: Machine;
    private count: number;
    private timer: egret.Timer;

    public constructor(machine: Machine) {
        this.machine = machine;
        this.count = 4;
    }

    public Idel(): void { 
        console.log("What2?!");
    }

    public ClickandRun(a:number,b:number): void {
        this.timer = new egret.Timer(100,0);
        this.timer.addEventListener(egret.TimerEvent.TIMER, this.timerFunc2, this);
        this.timer.start();
        var tween = egret.Tween.get(this.machine.rongqi);
        tween.to({x:a-99,y:b-187},1000).call(()=>{
            this.machine.setstate(this.machine.Standing)
            this.machine.getstate().Idel();
            })
    }
        private timerFunc2(event: egret.Event) {
        if(this.machine.rongqi.numChildren>0){
            this.machine.rongqi.removeChildAt(0);
        }
        this.machine.rongqi.addChild(this.machine.man[this.count]);
        this.count++;
        if(this.count>=8)
        {
            this.count=4;
        }
        if(this.machine.getstate()!=this){
            this.timer.stop();
        }
    }
}


