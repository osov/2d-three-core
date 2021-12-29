import {EventDispatcher} from 'three';
import {Entity} from '../entitys/Entity';

class BaseComponent extends EventDispatcher{

	protected entity:Entity;

	constructor()
	{
		super();
	}

	onAdded(entity:Entity)
	{
		this.entity = entity;
	}

	onRemoved()
	{

	}

	doUpdate(deltaTime:number)
	{

	}



}