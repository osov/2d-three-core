import {Vector2, Vector3,  Object3D, Line, LineBasicMaterial, BufferGeometry, Event} from 'three';
import {BaseHelper} from './BaseHelper';
import {GameManager} from '../managers/GameManager';
import * as t from 'three';

export interface EventUpdate extends t.Event{
	deltaTime:number;
	now:number;
}

export class LooperHelper extends BaseHelper{

	private rafName:string;
	private idTimer: number;
	private lastUpdate:number = 0;

	constructor(gm:GameManager)
	{
		super(gm);
	}

	init()
	{
		this.initRafDetector();
		requestAnimationFrame(this.mainLoop.bind(this));
	}

	initRafDetector()
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

	isRaf()
	{
		return (document.visibilityState === 'visible');
	}

	changeRaf()
	{
		const val = this.isRaf();
		if (!val)
			this.mainLoopTimeout();
		else
			clearTimeout(this.idTimer);
	}

	mainLoopTimeout()
	{
		console.log("Timeout");
		this.dispatchEvent({'type':'updateTimeout'});
		this.idTimer = setTimeout(this.mainLoopTimeout.bind(this), 100) as any as number;
	}

	mainLoop(now:number)
	{
		const deltaTime = now - this.lastUpdate;
		this.lastUpdate = now;
		this.update(deltaTime, now);
		requestAnimationFrame(this.mainLoop.bind(this));
	}

	update(deltaTime:number, now:number)
	{
		this.dispatchEvent({'type':'update', 'deltaTime':deltaTime, 'now':now});
	}


}