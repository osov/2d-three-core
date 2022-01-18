import {BaseHelper} from './BaseHelper';
import {Event} from 'three';

export interface EventUpdate extends Event{
	deltaTime:number;
	now:number;
}

export class LooperHelper extends BaseHelper{

	public maxDeltaTime = 100;
	private idTimer: number;
	private lastUpdate:number = 0;
	private lastUpdateTimeout:number = 0;

	init()
	{
		this.initRafDetector();
		requestAnimationFrame(this.mainLoop.bind(this));
	}

	private initRafDetector()
	{
		var stateKey = '',
		eventKey = '',
		keys:{[k:string]:string} = {
			hidden: "visibilitychange",
			webkitHidden: "webkitvisibilitychange",
			mozHidden: "mozvisibilitychange",
			msHidden: "msvisibilitychange"
		};
		for (stateKey in keys)
		{
			if (stateKey in document)
			{
				eventKey = keys[stateKey];
				break;
			}
		}
		document.addEventListener(eventKey, this.changeRaf.bind(this));
	}

	isVisible()
	{
		return (document.visibilityState === 'visible');
	}

	private changeRaf()
	{
		const val = this.isVisible();
		if (!val)
			this.mainLoopTimeout();
		else
			clearTimeout(this.idTimer);
	}

	private mainLoopTimeout()
	{
		const now = Date.now();
		var deltaTime = now - this.lastUpdateTimeout;
		if (this.lastUpdateTimeout === 0)
			deltaTime = 16;
		if (deltaTime > this.maxDeltaTime)
			deltaTime = this.maxDeltaTime;
		this.lastUpdateTimeout = now;
		//console.log("Timeout", now, deltaTime);
		this.dispatchEvent({type:'updateTimeout', deltaTime, now:this.lastUpdate});
		this.idTimer = setTimeout(this.mainLoopTimeout.bind(this), 100) as any as number;
	}

	private mainLoop(now:number)
	{
		const deltaTime = now - this.lastUpdate;
		this.lastUpdate = now;
		this.update(deltaTime, now);
		requestAnimationFrame(this.mainLoop.bind(this));
	}

	private update(deltaTime:number, now:number)
	{
		if (deltaTime > this.maxDeltaTime)
			deltaTime = this.maxDeltaTime;
		this.dispatchEvent({type:'update', deltaTime, now});
	}


}