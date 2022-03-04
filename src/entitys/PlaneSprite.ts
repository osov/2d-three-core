import { MasterPool } from '../pool/MasterPool';
import { Mesh, MeshBasicMaterial, PlaneBufferGeometry, Texture, Vector2, Vector3 } from 'three';
import { BaseMesh } from './BaseMesh';
import * as TWEEN from '@tweenjs/tween.js';

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

	setAnchoredPosition(pos: Vector2) {
		this.setPosition(pos);
	}

	DOAnchorPos(pos: Vector2, time: number) {
		new TWEEN.Tween(this.position)
			.to(pos, time * 1000)
			.start()
	}

	DOScale(scale:Vector3, time:number){
		new TWEEN.Tween(this.scale)
			.to(scale, time * 1000)
			.start()
	}

	makeInstance() {
		var copy = new PlaneSprite(MasterPool.isCloneMaterial ? this.material.clone() : this.material);
		copy.imgList = this.imgList;
		this.makeChildsInstance(copy);
		return copy;
	}

}
