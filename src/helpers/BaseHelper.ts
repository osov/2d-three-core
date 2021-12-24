import {EventDispatcher} from 'three';
import {GameManager} from '../managers/GameManager';

export class BaseHelper extends EventDispatcher{

	protected gm:GameManager;

	constructor(manager:GameManager)
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
