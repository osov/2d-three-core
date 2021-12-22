import {Vector2} from 'three';
import {BaseManager} from './BaseManager';
import {Entity} from '../entitys/Entity';

export class EntitysManager extends BaseManager{

	public entitys:{[key: number]: Entity} = {};
	public dynamicEntitys:{[key: number]: Entity} = {};
	private lastId:number = 0;

	constructor()
	{
		super();
	}

	moveToDynamicList()
	{

	}

	removeFromDynamicList()
	{

	}

}