import {  Mesh, MeshBasicMaterial, PlaneBufferGeometry} from 'three';
import {BaseMesh} from './BaseMesh';


export class PlaneSprite extends BaseMesh{

	constructor(material:MeshBasicMaterial)
	{
		super();
		this.material = material;
		this.geometry = new PlaneBufferGeometry( 1, 1 );
		Mesh.prototype.updateMorphTargets.apply(this);
	}

	makeInstance()
	{
		var copy = new PlaneSprite(this.material);
		this.makeChildsInstance(copy);
		return copy;
	}

}
