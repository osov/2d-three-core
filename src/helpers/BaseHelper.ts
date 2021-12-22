import {SimpleEventEmitter} from '../core/EventEmitter';
import {GameManager} from '../managers/GameManager';

export class BaseHelper extends SimpleEventEmitter{

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
