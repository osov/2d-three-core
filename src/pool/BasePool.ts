import { Vector2, Vector3, EventDispatcher} from 'three';
import {Entity} from '../entitys/Entity';

/*
TODO
теоретичеки при put можно удалять от родителя, чтобы он не был в сцене привязан
если будет много объектов, то смысл есть, иначе можно и так оставить.
*/


export class BasePool extends Entity{
	protected source:Entity;
	protected maxCount:number;
	protected freeList:Entity[] = [];

	constructor(src:Entity, startCount = 1, maxCount = -1)
	{
		super();
		this.source = src;
		for (var i = 0; i < startCount; ++i)
			this.addNew(true);

	}

	private addNew(addToFree = true)
	{
		var copy = this.source.makeInstance();
		if (addToFree)
			this.put(copy);
		return copy;
	}

	get()
	{
		if (this.freeList.length == 0)
			this.addNew();
		var tmp = this.freeList.splice(0,1);
		var e = tmp[0];
		e.setVisible(true);
		return e;
	}

	put(e:Entity, checkFree = true)
	{
		if (checkFree && this.freeList.indexOf(e) > -1)
			return console.warn("Объект уже в списке", e);
		e.setVisible(false);
		this.freeList.push(e);
	}




}