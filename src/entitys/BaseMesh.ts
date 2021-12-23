import {Vector2, Vector3, Object3D, Sprite, Mesh, MeshBasicMaterial} from 'three';
import {Entity} from './Entity';

export class BaseMesh extends Entity{

	public readonly mesh:Mesh;

	constructor()
	{
		super();
	}

	onAdd(parent:Object3D)
	{
		parent.add(this.mesh);
	}

	onRemove()
	{
		if (this.mesh.parent !== null)
		{
			this.mesh.parent.remove(this.mesh);
			return true;
		}
		else
			return false;
	}

	onAddRaycast(group:Object3D)
	{
		group.add(this.mesh);
	}

	onRemoveRaycast(group:Object3D)
	{
		var index = group.children.indexOf(this.mesh);
		if (index > -1)
			group.remove(this.mesh);
	}

	setPosition(pos:Vector2|Vector3)
	{
		this.mesh.position.x = pos.x;
		this.mesh.position.y = pos.y;
		if (pos instanceof Vector3)
			this.mesh.position.z = pos.z;
	}

	setPositionXY(x:number,y:number)
	{
		this.mesh.position.x = x;
		this.mesh.position.y = y;

	}

	getPosition()
	{
		return this.mesh.position;
	}

	setVisible(val:boolean)
	{
		this.mesh.visible = val;
	}

	setColor(color:string, alpha = -1)
	{
		var mesh = this.mesh;
		if (alpha != -1)
		{
			if (mesh instanceof Sprite)
			{
				mesh.material.transparent = true;
				mesh.material.opacity = alpha;
			}
			else if (mesh instanceof Mesh)
			{
				var mat = mesh.material as MeshBasicMaterial;
				mat.transparent = true;
				mat.opacity = alpha;
			}
		}
		if (mesh instanceof Sprite)
		{
			mesh.material.color.set( color );
		}
		else if (mesh instanceof Mesh)
		{
			var mat = mesh.material as MeshBasicMaterial;
			mat.color.set( color );
		}
		else
			this.warn("Тип меша не найден:", mesh);
	}

	setRotation(angle:number)
	{
		var mesh = this.mesh;
		if (mesh instanceof Mesh)
			mesh.rotation.z = angle;
	}

	setScale(scale:number)
	{
		this.mesh.scale.setScalar(scale);
	}

	clone():BaseMesh
	{
		return new BaseMesh();
	}

	destroy()
	{

	}

}
