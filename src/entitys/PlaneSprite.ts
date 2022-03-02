import { MasterPool } from '../pool/MasterPool';
import { Mesh, MeshBasicMaterial, PlaneBufferGeometry, Texture } from 'three';
import { BaseMesh } from './BaseMesh';


export class PlaneSprite extends BaseMesh {
	protected className = 'PlaneSprite';
	protected imgList: Texture[] = [];
	constructor(material: MeshBasicMaterial) {
		super();
		this.material = material;
		this.geometry = new PlaneBufferGeometry(1, 1);
		Mesh.prototype.updateMorphTargets.apply(this);
	}

	addImageList(map: Texture) {
		this.imgList.push(map);
	}

	SetImageIndex(index: number) {
		var it: Texture;
		if (index < 0 || index + 1 > this.imgList.length)
			it = this.imgList[0];
		else
			it = this.imgList[index];
		this.material.map = it;	
	}

	makeInstance() {
		var copy = new PlaneSprite(MasterPool.isCloneMaterial ? this.material.clone() : this.material);
		copy.imgList = this.imgList;
		this.makeChildsInstance(copy);
		return copy;
	}

}
