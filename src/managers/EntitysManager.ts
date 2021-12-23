import {Vector2, Vector3, Object3D} from 'three';
import {BaseManager} from './BaseManager';
import {RenderManager} from './RenderManager';
import {Entity} from '../entitys/Entity';
import {PlaneSprite} from '../entitys/PlaneSprite';


export class EntitysManager extends BaseManager{

	public entitys:{[key: number]: Entity} = {};
	public dynamicEntitys:{[key: number]: Entity} = {};

	private lastId:number = 0;
	private readonly prefabs:{[key: string]: Entity} = {};
	private readonly rm:RenderManager;

	constructor(manager:RenderManager)
	{
		super();
		this.rm = manager;
	}

	private createBadEntity()
	{
		var entity = new PlaneSprite(this.rm.resourceManager.getTexture('bad'));
		return entity;
	}

	registerPrefab(name:string, prefab:Entity)
	{
		if (this.prefabs[name])
		{
			this.warn("Префаб уже зарегистрирован:", name);
			return false;
		}
		this.prefabs[name] = prefab;
		return true;
	}

	private createPrefab(name:string, pos:Vector3, angle:number = 0)
	{
		var entity:Entity;
		if (!this.prefabs[name])
		{
			this.warn("Префаб не зарегистрирован:", name);
			entity = this.createBadEntity();
		}
		else
		{
			var prefab = this.prefabs[name];
			entity = prefab.clone();
		}
		entity.setPosition(pos);
		entity.setRotation(angle);
		return entity;
	}

	addEntity(name:string, pos:Vector3, angle:number = 0, parent:Object3D|null = null, addToRaycast = false, id:number = -1)
	{
		if (id == -1)
			id = this.lastId++;

		if (this.entitys[id])
			this.warn("Сущность с таким ид существует", id, this.entitys[id]);
		var entity = this.createPrefab(name,pos,angle);
		entity.id = id;
		this.entitys[id] = entity;
		entity.onAdd(parent == null ? this.rm.scene : parent);
		if (addToRaycast)
			entity.onAddRaycast(this.rm.raycastGroup);
		return entity;
	}

	remove(entity:Entity)
	{
		entity.onRemoveRaycast(this.rm.raycastGroup);
		return entity.onRemove();
	}

}