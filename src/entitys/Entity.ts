import {BaseEntity} from 'ecs-threejs';

export class Entity extends BaseEntity{
	protected className = 'Entity';

	constructor()
	{
		super();
	}

	protected makeChildsInstance(copy:Entity)
	{
		for (var i = 0; i < this.children.length; ++i)
		{
			var child = this.children[i];
			if (child.parent === this)
			{
				//continue;
			}
			if (!(child instanceof Entity))
			{
				continue;
			}
			var childSrc = child as Entity;
			var subCopy = childSrc.makeInstance();
			copy.add(subCopy);
			this.copyProps(childSrc, subCopy);
			//copy.copy(childSrc, false);
		}
		copy.scale.copy(this.scale);
		copy.userData = JSON.parse(JSON.stringify(this.userData)); //Object.assign не пашет видимо из-за глубины объекта
		if (Object.keys(this.components).length > 0)
		{
			for (var k in this.components) {
				const cmp = this.components[k];
				var c = new (cmp as any).constructor();
				copy.addComponent(c);
			}
		}
	}

	private copyProps(src:Entity, target:Entity)
	{
		target.position.copy(src.position);
		target.scale.copy(src.scale);
	}

	makeInstance()
	{
		var copy = new Entity();
		this.makeChildsInstance(copy);
		return copy;
	}

}
