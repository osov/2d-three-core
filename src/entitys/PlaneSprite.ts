import {Vector2, Vector3, Object3D, Sprite, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Texture, RepeatWrapping} from 'three';
import {BaseMesh} from './BaseMesh';


export class PlaneSprite extends BaseMesh{

	public readonly mesh:Mesh;
	private texture:Texture;

	constructor(texture:Texture)
	{
		super();
		this.texture = texture;
		const geometry = new PlaneBufferGeometry( 1, 1 );
		const material = new MeshBasicMaterial( {color: 0xffffff, map:texture} );
		if (material.map)
			material.map.wrapS = material.map.wrapT = RepeatWrapping;
		this.mesh = new Mesh(geometry, material);
	}

	clone():PlaneSprite
	{
		return new PlaneSprite(this.texture);
	}

}
