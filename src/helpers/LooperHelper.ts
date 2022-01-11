import {Vector2, Vector3,  Object3D, Line, LineBasicMaterial, BufferGeometry, Event} from 'three';
import {BaseHelper} from './BaseHelper';
import {GameSystem} from '../systems/GameSystem';
import * as t from 'three';

export interface EventUpdate extends t.Event{
	deltaTime:number;
	now:number;
}

export class LooperHelper extends BaseHelper{

	private rafName:string;
	private idTimer: number;
	private lastUpdate:number = 0;
	private lastUpdateTimeout:number = 0;

	constructor(gm:GameSystem)
	{
		super(gm);
	}

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
		this.rafName = stateKey;
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
		this.dispatchEvent({type:'update', deltaTime, now});
	}


}