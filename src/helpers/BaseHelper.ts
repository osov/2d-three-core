import { BaseSystem } from 'ecs-threejs';
import {GameSystem} from '../systems/GameSystem';

export class BaseHelper extends BaseSystem{

	protected gs:GameSystem;

	constructor(manager:GameSystem)
	{
		super();
		this.gs = manager;
	}

	init()
	{

	}

	destroy()
	{

	}

}
