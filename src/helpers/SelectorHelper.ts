import {Vector2, Object3D, Raycaster, Camera, Group} from 'three';
import {BaseHelper} from './BaseHelper';

export class SelectorHelper extends BaseHelper{

	public selectedObject:Object3D|null = null;
	public isClickIntersect = false;
	public isMoveIntersect = false;

	private raycaster = new Raycaster();

	constructor(v:any)
	{
		super(v);
	}

	init()
	{
		this.on("onMove", this.onMove.bind(this));
		this.on("onDown", this.onInputDown.bind(this));
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
			( this.gm.mousePos.x / this.gm.container.clientWidth ) * 2 - 1,
			- (this.gm.mousePos.y / this.gm.container.clientHeight ) * 2 + 1
		);
		this.raycaster.setFromCamera( pointer, this.gm.camera );
		const intersects = this.raycaster.intersectObject( this.gm.raycastGroup, true );
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
		//console.log('enter', mesh);
		this.gm.emit("onEnter", mesh);
	}

	private onLeaveItem(mesh:Object3D)
	{
		//console.log('leave', mesh);
		this.gm.emit("onLeave", mesh);
	}


}
