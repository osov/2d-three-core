import {Vector2, Vector3, Object3D, PointsMaterial, BufferGeometry,Float32BufferAttribute, Points} from 'three';
import {Entity} from './Entity';
import {ParticlePool} from './ParticlePool';
import {deepPosition} from '../core/gameUtils';

export class ParticleItem extends Entity{

	private pool:ParticlePool;
	private idParticle:number;

	constructor(pool:ParticlePool)
	{
		super();
		this.pool = pool;
	}

	addToParent(parent:Object3D)
	{
		this.idParticle = this.pool.getFreeIndex();
		if (this.idParticle == -1)
			console.warn("Частица не выдана:", this);
	}

	removeFromParent()
	{
		this.pool.freeIndex(this.idParticle);
		this.idParticle = -1;
		return this;
	}

	setPosition(pos:Vector2|Vector3)
	{
		super.setPosition(pos);
		this.pool.setIndexPosition(this.idParticle, pos);
	}

	setPositionXY(x:number,y:number)
	{
		super.setPositionXY(x,y);
		this.pool.setIndexPosition(this.idParticle, new Vector2(x,y));
	}


	setVisible(val:boolean)
	{
		super.setVisible(val);
		this.pool.setIndexPosition(this.idParticle, val ? this.position : deepPosition);
	}

	setRotation(angle:number)
	{
		super.setRotation(angle);
		this.pool.setIndexRotation(this.idParticle, angle);
	}

	makeInstance()
	{
		var copy = new ParticleItem(this.pool);
		this.makeChildsInstance(copy);
		return copy;
	}


}