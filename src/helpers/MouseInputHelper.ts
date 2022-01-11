import {Vector2, Vector3} from 'three';
import {BaseHelper} from './BaseHelper';
import {GameSystem} from '../systems/GameSystem';

interface InputEvent{
	key:number;
	status:boolean;
}

export class MouseInputHelper extends BaseHelper{

	public mouseInterval:number = 50;
	public mouseAngle:number = -1;
	private mousePos:Vector2 = new Vector2();
	private events:InputEvent[] = [];
	private mouseTime:number = 0;
	private curKeys:{[k:number]:number} = {};
	private lastKeys:{[k:number]:number} = {};

	constructor(gs:GameSystem)
	{
		super(gs);
		gs.container.addEventListener('mousemove', this.onMouseMove.bind(this));
		gs.container.addEventListener ('mousedown', e =>
		{
			this.curKeys[e.button] = 1;
		});
		gs.container.addEventListener ('mouseup', e =>
		{
			this.curKeys[e.button] = 0;
		});
	}

	private onMouseMove(event:MouseEvent)
	{
		this.mousePos.x = event.pageX;
		this.mousePos.y = event.pageY;
	}

	private addMouseEvent(key:number, status:boolean)
	{
		this.events.push({key, status});
	}

	public isMoveMouse()
	{
		var now = Date.now();
		if (this.mouseTime + this.mouseInterval > now)
			return false;
		this.mouseTime = now;
		var w = this.gm.container.clientWidth;
		var h = this.gm.container.clientHeight;
		var center = new Vector2(w/2, h/2);
		var dir = new Vector2(this.mousePos.x, this.mousePos.y).sub(center);
		var angle = Math.atan2(dir.x, dir.y);
		var a = Math.floor(angle / Math.PI * 180 + 180);
		if (this.mouseAngle != a)
		{
			this.mouseAngle = a;
			return true;
		}
		return false;
	}

	public isEventMouse()
	{
		for (var k in this.curKeys)
		{
			var status = this.curKeys[k];
			if (this.lastKeys[k] === undefined || status != this.lastKeys[k])
			{
				this.lastKeys[k] = status;
				return {key:k, status:status};
			}
		}
		return false;
	}





}