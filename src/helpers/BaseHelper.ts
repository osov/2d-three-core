import {EventDispatcher} from 'three';
import {GameSystem} from '../systems/GameSystem';

export class BaseHelper extends EventDispatcher{

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
