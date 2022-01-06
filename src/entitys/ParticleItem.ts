import {Vector2, Vector3, Object3D, PointsMaterial, BufferGeometry,Float32BufferAttribute, Points} from 'three';
import {Entity} from '../entitys/Entity';
import {ParticlesStack} from './ParticlesStack';
import {deepPosition} from '../core/gameUtils';

export class ParticleItem extends Entity{

	private stack:ParticlesStack;
	private idParticle:number;

	constructor(stack:ParticlesStack)
	{
		super();
		this.stack = stack;
	}

	addToParent(parent:Object3D)
	{
		this.idParticle = this.stack.getFreeIndex();
		if (this.idParticle == -1)
			console.warn("Частица не выдана:", this);
	}

	removeFromParent()
	{
		this.stack.freeIndex(this.idParticle);
		this.idParticle = -1;
		return this;
	}

	setPosition(pos:Vector2|Vector3)
	{
		super.setPosition(pos);
		this.stack.setIndexPosition(this.idParticle, pos);
	}

	setPositionXY(x:number,y:number)
	{
		super.setPositionXY(x,y);
		this.stack.setIndexPosition(this.idParticle, new Vector2(x,y));
	}


	setVisible(val:boolean)
	{
		super.setVisible(val);
		this.stack.setIndexPosition(this.idParticle, val ? this.position : deepPosition);
	}

	setRotationDeg(angle:number)
	{
		super.setRotationDeg(angle);
		this.stack.setIndexRotation(this.idParticle, angle * Math.PI / 180);
	}

	setRotationRad(angle:number)
	{
		super.setRotationRad(angle);
		this.stack.setIndexRotation(this.idParticle, angle);
	}

	makeInstance()
	{
		var copy = new ParticleItem(this.stack);
		this.makeChildsInstance(copy);
		return copy;
	}


}