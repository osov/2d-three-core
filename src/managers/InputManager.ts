import * as THREE from 'three';
import {SimpleEventEmitter} from '../core/EventEmitter';

interface BaseKeys{
	left:boolean;
	right:boolean;
}

export class InputManager extends SimpleEventEmitter{

	public mousePos:THREE.Vector2 = new THREE.Vector2();
	public baseKeys:BaseKeys = {left:false, right:false};

	constructor()
	{
		super();
		document.addEventListener('pointermove', this.onPointerMove.bind(this), false );
		document.addEventListener("touchmove",  this.onTouchMove.bind(this), false);
		document.addEventListener('mousedown', this.onMouseDown.bind(this), false);
		document.addEventListener('mouseup', this.onMouseUp.bind(this), false);
		document.addEventListener("touchstart", this.onTouchStart.bind(this), false);
		document.addEventListener("touchend", this.onTouchEnd.bind(this), false);
		window.addEventListener('resize', this.onResize.bind(this), false);
	}

	onResize()
	{

	}

	private onTouchStart(event:TouchEvent)
	{
		this.onMove(event.touches[0].clientX, event.touches[0].clientY);
		this.onInputDown(event.touches[0].clientX, event.touches[0].clientY);
	}

	private onTouchEnd(event:TouchEvent)
	{
		if (event.touches.length == 0)
			return this.onInputUp(this.mousePos.x, this.mousePos.y);
		this.onInputUp(event.touches[0].clientX, event.touches[0].clientY)
	}

	private onMouseDown(event:MouseEvent)
	{
		if (event.button == 0)
			this.baseKeys.left = true;
		if (event.button == 2)
			this.baseKeys.right = true;
		this.onInputDown(event.clientX, event.clientY);
	}

	private onMouseUp(event:MouseEvent)
	{
		if (event.button == 0)
			this.baseKeys.left = false;
		if (event.button == 2)
			this.baseKeys.right = false;
		this.onInputUp(event.clientX, event.clientY);
	}

	private onTouchMove(event:TouchEvent)
	{
		this.onMove(event.touches[0].clientX, event.touches[0].clientY);
	}

	private onPointerMove(event:PointerEvent)
	{
		this.onMove(event.clientX, event.clientY);
	}

	onMove(clientX = 0,clientY = 0)
	{
		this.setPointers(clientX, clientY);
		this.emit("onMove", this.mousePos);
	}

	onInputDown(clientX = 0, clientY = 0)
	{
		this.setPointers(clientX, clientY);
		this.emit("onDown", clientX, clientY);
	}

	private onInputUp(clientX = 0, clientY = 0)
	{
		this.emit("onUp", clientX, clientY);
	}

	setPointers(clientX = 0,clientY = 0)
	{
		this.mousePos.x = clientX;
		this.mousePos.y = clientY;
	}



}