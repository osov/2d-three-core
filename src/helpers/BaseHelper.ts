import { BaseSystem } from 'ecs-threejs';
import {GameSystem} from '../systems/GameSystem';

export class BaseHelper extends BaseSystem{

	protected gm:GameSystem;

	constructor(manager:GameSystem)
	{
		super();
		this.gm = manager;
	}

	init()
	{

	}

	destroy()
	{

	}

}
