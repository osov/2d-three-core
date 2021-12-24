import {Vector2, Vector3, Object3D} from 'three';

export class Entity extends Object3D{

	public idEntity:number = -1;
	public prefabName:string;

	constructor()
	{
		super();
	}

	doUpdate(deltaTime:number)
	{

	}

	addToParent(parent:Object3D)
	{
		parent.add(this);
	}

	removeFromParent()
	{
		return super.removeFromParent();
	}


	setPosition(pos:Vector2|Vector3)
	{
		if (pos instanceof Vector2)
			this.position.set(pos.x, pos.y, this.position.z);
		else
			this.position.copy(pos);
	}

	setPositionXY(x:number,y:number)
	{
		this.position.set(x, y, this.position.z);
	}

	getPosition()
	{
		return this.position;
	}

	setVisible(val:boolean)
	{
		this.visible = val;
	}

	setRotation(angle:number)
	{
		this.rotation.z = angle;
	}

	setScale(scale:number)
	{
		this.scale.setScalar(scale);
	}

	protected makeChildsInstance(dst:Entity)
	{
		for (var i = 0; i < this.children.length; ++i)
		{
			if (!(this.children[i] instanceof Entity))
				continue;
			var childSrc = this.children[i] as Entity;
			var copy = childSrc.makeInstance();
			dst.add(copy);
			copy.copy(childSrc, false);
		}
	}

	makeInstance()
	{
		var copy = new Entity();
		this.makeChildsInstance(copy);
		return copy;
	}

	destroy()
	{

	}

}
