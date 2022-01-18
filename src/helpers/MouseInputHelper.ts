import { Vector2 } from 'three';
import { BaseHelper } from './BaseHelper';

interface InputEvent {
	key: number;
	status: boolean;
}

export class MouseInputHelper extends BaseHelper {

	public mouseInterval: number = 50;
	public mouseAngle: number = -1;
	private mousePos: Vector2 = new Vector2();
	private mouseTime: number = 0;
	private curKeys: { [k: number]: boolean } = {};
	private lastKeys: { [k: number]: boolean } = {};

	init() {
		this.gs.container.addEventListener('mousemove', this.onMouseMove.bind(this));
		this.gs.container.addEventListener('mousedown', e => {
			this.curKeys[e.button] = true;
		});
		this.gs.container.addEventListener('mouseup', e => {
			this.curKeys[e.button] = false;
		});
	}

	private onMouseMove(event: MouseEvent) {
		this.mousePos.x = event.pageX;
		this.mousePos.y = event.pageY;
	}

	public isMoveMouse() {
		var now = Date.now();
		if (this.mouseTime + this.mouseInterval > now)
			return { hasEvent: false, angle: this.mouseAngle };
		this.mouseTime = now;
		var w = this.gs.container.clientWidth;
		var h = this.gs.container.clientHeight;
		var center = new Vector2(w / 2, h / 2);
		var dir = new Vector2(this.mousePos.x, this.mousePos.y).sub(center);
		var angle = Math.atan2(dir.x, dir.y);
		var a = Math.floor(angle / Math.PI * 180 + 180);
		if (this.mouseAngle != a) {
			this.mouseAngle = a;
			return { hasEvent: true, angle: a };
		}
		return { hasEvent: false, angle: a };
	}

	public isEventMouse() {
		for (var k in this.curKeys) {
			var status = this.curKeys[k];
			if (this.lastKeys[k] === undefined || status !== this.lastKeys[k]) {
				this.lastKeys[k] = status;
				return { hasEvent: true, key: k, status: status };
			}
		}
		return { hasEvent: false, key: '', status: false };
	}





}