import {Vector2, Vector3, Object3D, MeshBasicMaterial} from 'three';
import {BaseManager} from './BaseManager';
import {RenderManager} from './RenderManager';
import {Entity} from '../entitys/Entity';
import {PlaneSprite} from '../entitys/PlaneSprite';


export class EntitysManager extends BaseManager{

	public entitys:{[key: number]: Entity} = {};
	public dynamicEntitys:{[key: number]: Entity} = {};
	public idLocalEntity:number = -1;

	private lastId:number = 0;
	private prefabs:{[key: string]: Entity} = {};
	private renderManager:RenderManager;

	constructor(manager:RenderManager)
	{
		super();
		this.renderManager = manager;
	}

	init()
	{

	}

	private createBadEntity()
	{
		var entity = new PlaneSprite(this.renderManager.resourceManager.getMaterial('bad'));
		return entity;
	}

	registerPrefab(name:string, prefab:Entity)
	{
		if (this.prefabs[name])
		{
			console.warn("Префаб уже зарегистрирован:", name);
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
			console.warn("Префаб не зарегистрирован:", name);
			entity = this.createBadEntity();
		}
		else
		{
			var prefab = this.prefabs[name];
			entity = prefab.makeInstance();
		}
		entity.setPosition(pos);
		entity.setRotation(angle);
		return entity;
	}

	addEntity(name:string, pos:Vector3, angle:number = 0, parent:Object3D|null = null, id:number = -1)
	{
		if (id == -1)
			id = this.lastId++;
		if (this.entitys[id])
			console.warn("Сущность с таким ид существует", id, this.entitys[id]);
		var entity = this.createPrefab(name, pos, angle);
		entity.idEntity = id;
		entity.prefabName = name;
		this.entitys[id] = entity;
		entity.addToParent(parent === null ? this.renderManager.scene : parent)
		this.renderManager.dispatchEvent({type:'onAddEntity', entity:entity});
		return entity;
	}

	remove(entity:Entity)
	{
		this.renderManager.dispatchEvent({type:'onRemoveEntity', entity:entity});
		entity.destroy();
		if (entity.parent !== null)
			entity.parent.remove(entity);
		delete this.entitys[entity.idEntity];
	}


	clearScene(fullClear:boolean = true)
	{
		for (var id in this.entitys)
		{
			var e = this.entitys[id];
			this.remove(e);
		}
		// в теории метод не нужен если не будет дублей среди сущностей
		if (fullClear)
		{
			for (var i = this.renderManager.scene.children.length - 1; i >= 0; i--)
			{
				var m = this.renderManager.scene.children[i];
				if (m instanceof Entity)
					m.destroy();
				if (m.parent)
					m.parent.remove(m);
			}
		}
		this.prefabs = {};
		this.entitys = {};
		this.dynamicEntitys = {};
		this.lastId = 0;
	}

	setIdLocalEntity(id:number)
	{
		this.idLocalEntity = id;
	}

}