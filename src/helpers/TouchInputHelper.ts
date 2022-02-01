import { Input } from "ecs-threejs";
import { Vector2 } from "three";
import { BaseHelper } from "./BaseHelper";

export class TouchInputHelper extends BaseHelper {

	public moveInterval:number = 50;
	private touchId: number = 0;
	private origin: Vector2 = new Vector2(-1, -1);
	private trackpad: HTMLElement;
	private tracker: HTMLElement;
	private shotPad: HTMLElement;
	private moveTime:number = 0;
	private curAngle:number = 0;
	private lastAngle:number = 0;
	private curShotStatus:boolean = false;
	private lastShotStatus:boolean = false;
	private curMoveStatus:boolean = false;
	private lastMoveStatus:boolean = false;

	initUi(trackpad: HTMLElement, tracker: HTMLElement, shot_pad: HTMLElement) {
		this.trackpad = trackpad;
		this.tracker = tracker;
		this.shotPad = shot_pad;
		this.trackpad.addEventListener('touchstart', this.touchDirStart.bind(this), false);
		this.trackpad.addEventListener('touchend', this.unmount.bind(this), true);
		this.trackpad.addEventListener('touchcancel', this.unmount.bind(this), true);
		this.shotPad.addEventListener('touchstart', this.touchShotStart.bind(this), false);
		this.shotPad.addEventListener('touchend', this.touchShotStop.bind(this), true);
		document.addEventListener('touchmove', this.touchMove.bind(this), true);
		if (Input.isTouchMode() && trackpad.parentElement)
			trackpad.parentElement.style.display = '';
	}

	private touchShotStart(e: TouchEvent) {
		this.callEvent('shot', true);
		this.shotPad.classList.add('active');
		e.preventDefault();
	}

	private touchShotStop(e: TouchEvent) {
		this.callEvent('shot', false);
		this.shotPad.classList.remove('active');
	}

	private touchDirStart(e: TouchEvent) {
		var touch = e.targetTouches.item(0);
		if (!touch)
			return;
		this.touchId = touch.identifier;
		this.origin = new Vector2(touch.screenX, touch.screenY);
		this.trackpad.classList.add('active');
		e.preventDefault();
	}

	private onTrackerScreenPos(e: Touch) {
		var x = 2 * (e.screenX - this.origin.x) / this.gs.container.clientWidth;
		var y = 2 * (e.screenY - this.origin.y) / this.gs.container.clientHeight;
		var tx = x * 100;
		var ty = y * 100;
		var dd = 20;
		if (tx > dd)
			tx = dd;
		else if (tx < -dd)
			tx = -dd;
		if (ty > dd)
			ty = dd;
		else if (ty < -dd)
			ty = -dd;
		tx += 50;
		ty += 50;
		var angle = Math.atan2(x, -y);
		if (angle < 0)
			angle += Math.PI * 2;
		var magnitude = Math.min(dd, Math.sqrt(Math.pow(tx-50, 2) + Math.pow(ty-50, 2)))/dd;

		var ca = Math.PI - angle;

		var pos = new Vector2(Math.sin(ca), Math.cos(ca)).multiplyScalar(dd).add(new Vector2(50, 50));
		pos.set(tx, ty);
		this.tracker.style.left = pos.x + "%";
		this.tracker.style.top = pos.y + "%";
		angle = Number(((2 * Math.PI - angle) * 180 / Math.PI).toFixed(2));
		this.curAngle = angle;
		return { 'angle': angle, 'magnitude': magnitude };
	}

	private touchMove(e: TouchEvent) {
		if (this.origin.x != -1 && this.origin.y != -1) {
			var touch: Touch | null = null;
			for (var i = 0; i < e.touches.length; ++i) {
				var ti = e.touches.item(i);
				if (ti && ti.identifier == this.touchId) {
					touch = e.touches.item(i);
				}
			}
			if (touch)
				this.callEvent('move', true, this.onTrackerScreenPos(touch));
			else
				this.unmount();
		}
	}

	private unmount() {
		this.trackpad.classList.remove('active');
		this.origin = new Vector2(-1, -1);
		this.tracker.style.left = "50%";
		this.tracker.style.top = "50%";
		this.callEvent('move', false);
	}

	private callEvent(typ: string, status: boolean, data = {}) {
		if (typ == 'shot')
			this.curShotStatus = status;
			if (typ == 'move')
			this.curMoveStatus = status;
		this.dispatchEvent({ type: 'touchEvent', typ, status, data });
		//console.log(typ, status, data);
	}

	isMove()
	{
		var now = Date.now();
		if (this.moveTime + this.moveInterval > now)
			return {hasEvent:false, status:this.lastMoveStatus, angle:this.lastAngle};
		this.moveTime = now;
		if (this.curAngle != this.lastAngle || this.curMoveStatus != this.lastMoveStatus)
		{
			this.lastMoveStatus = this.curMoveStatus;
			this.lastAngle = this.curAngle;
			return {hasEvent:true, status:this.lastMoveStatus, angle:this.lastAngle};
		}
		return {hasEvent:false, status:this.lastMoveStatus, angle:this.lastAngle};
	}

	isBtnEvent()
	{
		if (this.lastShotStatus != this.curShotStatus)
		{
			this.lastShotStatus = this.curShotStatus;
			return {hasEvent:true, status:this.lastShotStatus};
		}
		return {hasEvent:false, status:this.lastShotStatus};
	}

}