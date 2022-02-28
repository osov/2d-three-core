import {BaseEntity} from 'ecs-threejs';

export class Entity extends BaseEntity{

	constructor()
	{
		super();
	}

	protected makeChildsInstance(dst:Entity)
	{
		for (var i = 0; i < this.children.length; ++i)
		{
			var child = this.children[i];
			if (child.parent === this)
				continue;
			if (!(child instanceof Entity))
				continue;
			var childSrc = child as Entity;
			var copy = childSrc.makeInstance();
			dst.add(copy);
			copy.copy(childSrc, false);
		}
		dst.scale.copy(this.scale);
	}

	makeInstance()
	{
		var copy = new Entity();
		this.makeChildsInstance(copy);
		return copy;
	}

}
