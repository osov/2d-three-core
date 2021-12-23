import {Vector2, Vector3, Object3D} from 'three';
import {SimpleEventEmitter} from '../core/EventEmitter';

export class Entity extends SimpleEventEmitter{

	public id:number = -1;
	public readonly isAddToScene = true;

	constructor()
	{
		super();
	}

	onAdd(parent:Object3D)
	{

	}

	onAddRaycast(group:Object3D)
	{

	}

	onRemoveRaycast(group:Object3D)
	{

	}


	onRemove()
	{

	}

	setPosition(pos:Vector2|Vector3)
	{

	}

	setPositionXY(x:number,y:number)
	{

	}

	getPosition()
	{
		return new Vector3();
	}

	setVisible(val:boolean)
	{

	}

	setColor(color:string, alpha = -1)
	{

	}

	setRotation(angle:number)
	{

	}

	setScale(scale:number)
	{

	}

	clone():Entity
	{
		return new Entity();
	}

	destroy()
	{

	}
}
