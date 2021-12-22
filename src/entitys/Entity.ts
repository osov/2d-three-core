import {Vector2, Vector3} from 'three';

export enum EntityType{
	mesh,
	sprite,
	particle,
	text
}

export class Entity{

	public type:EntityType;
	public isStatic:boolean;

	constructor()
	{

	}

	setPosition(pos:Vector2|Vector3)
	{

	}

	setRotation(z:number)
	{

	}

	getPosition()
	{

	}

	getRotation()
	{

	}
}
