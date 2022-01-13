import {BasePool} from './BasePool';
import {Entity} from '../entitys/Entity';
import {ParticlesStack} from '../entitys/ParticlesStack';

export class ParticlesPool extends BasePool{

	private stack:ParticlesStack
	constructor(src:Entity, stack:ParticlesStack)
	{
		super(src, 0);
		this.stack = stack;
	}

	setRenderOrder(index:number)
	{
		super.setRenderOrder(index);
		this.stack.setRenderOrder(index);
	}

	setPositionZ(z: number): void {
		this.stack.position.z = z;
	}
}