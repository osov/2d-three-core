import {Vector2} from 'three';
import {BaseSystem} from './BaseSystem';

interface BaseKeys{
	left:boolean;
	right:boolean;
}

export class EventSystem extends BaseSystem{

	public mousePos:Vector2 = new Vector2();
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

	protected onResize()
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

	protected onMove(clientX = 0,clientY = 0)
	{
		this.setPointers(clientX, clientY);
		this.dispatchEvent({type:"onMove", 'position': this.mousePos});
	}

	protected onInputDown(clientX = 0, clientY = 0)
	{
		this.setPointers(clientX, clientY);
		this.dispatchEvent({type:"onDown", 'position': this.mousePos});
	}

	private onInputUp(clientX = 0, clientY = 0)
	{
		this.setPointers(clientX, clientY);
		this.dispatchEvent({type:"onUp", 'position': this.mousePos});
	}

	protected setPointers(clientX = 0,clientY = 0)
	{
		this.mousePos.x = clientX;
		this.mousePos.y = clientY;
	}



}