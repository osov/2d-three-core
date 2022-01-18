import {Vector2, Object3D, Raycaster} from 'three';
import {BaseHelper} from './BaseHelper';
import {Entity} from '../entitys/Entity';

export class SelectorHelper extends BaseHelper{

	public selectedObject:Object3D|null = null;
	public isClickIntersect = false;
	public isMoveIntersect = false;

	private raycaster = new Raycaster();
	private list:Entity[] = [];

	init()
	{
		this.gs.addEventListener("onMove", this.onMove.bind(this));
		this.gs.addEventListener("onDown", this.onInputDown.bind(this));
	}

	add(entity:Entity)
	{
		this.list.push(entity);
	}

	clear()
	{
		this.list = [];
	}

	private onMove()
	{
		if (this.isMoveIntersect)
			this.checkOnIntersect();
	}

	protected onInputDown()
	{
		if (this.isClickIntersect)
			this.checkOnIntersect();
	}

	private checkOnIntersect()
	{
		var pointer = new Vector2(
			( this.gs.mousePos.x / this.gs.container.clientWidth ) * 2 - 1,
			- (this.gs.mousePos.y / this.gs.container.clientHeight ) * 2 + 1
		);
		this.raycaster.setFromCamera( pointer, this.gs.camera );
		const intersects = this.raycaster.intersectObjects( this.list, false );
		if ( intersects.length > 0 )
		{
			const res = intersects.filter( function ( res ){return res && res.object;})[0];
			if ( res && res.object )
			{
				if (this.selectedObject == res.object)
					return;

				if (this.selectedObject)
					this.onLeaveItem(this.selectedObject);
				this.selectedObject = res.object;
				this.onEnterItem(this.selectedObject);
			}
		}
		else if (this.selectedObject)
		{
			this.onLeaveItem(this.selectedObject);
			this.selectedObject = null;
		}
	}

	private onEnterItem(mesh:Object3D)
	{
		this.log('enter', mesh);
		this.gs.dispatchEvent({type:"onEnter", mesh: mesh});
	}

	private onLeaveItem(mesh:Object3D)
	{
		//this.log('leave', mesh);
		this.gs.dispatchEvent({type:"onLeave", mesh: mesh});
	}


}
