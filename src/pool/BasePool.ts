import {Entity} from '../entitys/Entity';
import * as ECS from 'ecs-threejs';

/*
TODO
теоретичеки при put можно удалять от родителя, чтобы он не был в сцене привязан
если будет много объектов, то смысл есть, иначе можно и так оставить.
*/

// не наследуем от ecs.BasePool потому что в будущем нам нужны свойства типа setRenderOrder, setPosition и т.п.
export class BasePool extends Entity{

	protected pool:ECS.BasePool<Entity>;

	constructor(src:Entity, startCount = 1)
	{
		super();
		this.pool = new ECS.BasePool<Entity>(src, startCount);
	}

	get()
	{
		var e = this.pool.get();
		e.setVisible(true);
		return e;
	}

	put(e:Entity, checkFree = true)
	{
		e.setVisible(false);
		return this.pool.put(e, checkFree);
	}

}