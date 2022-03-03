import { BaseSystem } from 'ecs-threejs';
import { GameSystem } from '../systems/GameSystem';

export class BaseHelper extends BaseSystem{
	protected gs:GameSystem;
	
	constructor()
	{
		super();
		this.gs = GameSystem.instance;
		
	}

	init()
	{

	}

	destroy()
	{

	}

}
