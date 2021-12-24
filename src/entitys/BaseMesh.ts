import {Vector2, Vector3, Object3D, Sprite, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Raycaster, Intersection} from 'three';
import {Entity} from './Entity';

export class BaseMesh extends Entity{

	public geometry:PlaneBufferGeometry;
	public material:MeshBasicMaterial;
	protected isMesh = true;

	copy(source:any, recursive:boolean = true)
	{
		Mesh.prototype.copy.apply(this, [source, recursive]);
		return this;
	}

	raycast(raycaster:Raycaster, intersects:Intersection<Object3D<Event>>[])
	{
		return Mesh.prototype.raycast.apply(this, [raycaster, intersects]);
	}

	setColor(color:string, alpha = -1)
	{
		var mesh = this;
		var mat = mesh.material;
		if (alpha != -1)
		{
			mat.transparent = true;
			mat.opacity = alpha;
		}
		mat.color.set( color );
	}

}
