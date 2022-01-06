import {Vector2, Vector3, Object3D, MeshBasicMaterial, PointsMaterial} from 'three';
import {BaseSystem} from './BaseSystem';
import {RenderSystem} from './RenderSystem';
import {Entity} from '../entitys/Entity';
import {PlaneSprite} from '../entitys/PlaneSprite';
import {PoolsManager} from '../pool/PoolsManager';

const startLocalId = 65535;

export class EntitysSystem extends BaseSystem{

	public entitys:{[key: number]: Entity} = {};
	public dynamicEntitys:{[key: number]: Entity} = {};
	public idLocalEntity:number = -1;

	private lastId:number = startLocalId;
	private renderSystem:RenderSystem;
	private poolsManager:PoolsManager;

	constructor(system:RenderSystem)
	{
		super();
		this.renderSystem = system;
		this.poolsManager = new PoolsManager(system);
	}

	init()
	{

	}

	private createBadEntity()
	{
		var entity = new PlaneSprite(this.renderSystem.resourceSystem.getMaterial('bad'));
		return entity;
	}

	registerPrefab(name:string, prefab:Entity)
	{
		return this.poolsManager.registerObjectsPool(name, prefab)
	}

	registerParticlePool(name:string, material:PointsMaterial, maxCount:number)
	{
		return this.poolsManager.registerParticlesPool(name, material, maxCount)
	}

	private createPrefab(name:string)
	{
		var entity:Entity;
		if (!this.poolsManager.hasPool(name))
		{
			console.warn("Префаб не зарегистрирован:", name);
			entity = this.createBadEntity();
		}
		else
		{
			entity = this.poolsManager.getPoolItem(name);
			entity.prefabName = name;
		}
		return entity;
	}

	addEntity(entity:Entity, pos:Vector3 = new Vector3(), angleDeg:number = 0, parent:Object3D|null = null, id:number = -1)
	{
		if (id == -1)
			id = this.lastId++;
		if (this.entitys[id])
			console.warn("Сущность с таким ид существует", id, this.entitys[id]);
		entity.idEntity = id;
		this.entitys[id] = entity;
		entity.addToParent(parent === null ? this.renderSystem.scene : parent);
		entity.setPosition(pos);
		entity.setRotationDeg(angleDeg);
		this.renderSystem.dispatchEvent({type:'onAddedEntity', entity:entity});
		return entity;
	}

	addEntityByName(name:string, pos:Vector3, angleDeg:number = 0, parent:Object3D|null = null, id:number = -1)
	{
		var entity = this.createPrefab(name);
		return this.addEntity(entity, pos, angleDeg, parent);
	}

	remove(entity:Entity, isDestroy = false)
	{
		this.renderSystem.dispatchEvent({type:'onBeforeRemoveEntity', entity:entity});
		delete this.entitys[entity.idEntity];
		if (isDestroy)
		{
			entity.destroy();
			if (entity.parent !== null)
				entity.parent.remove(entity);
		}
		else
			this.poolsManager.putPoolItem(entity);
	}

	getEntityById(id:number)
	{
		if (this.entitys[id] === undefined)
			return false;
		else
			return this.entitys[id];
	}


	clearScene(fullClear:boolean = true)
	{
		for (var id in this.entitys)
		{
			var e = this.entitys[id];
			this.remove(e, true);
		}
		// в теории метод не нужен если не будет дублей среди сущностей
		if (fullClear)
		{
			for (var i = this.renderSystem.scene.children.length - 1; i >= 0; i--)
			{
				var m = this.renderSystem.scene.children[i];
				if (m instanceof Entity)
					m.destroy();
				if (m.parent)
					m.parent.remove(m);
			}
		}
		this.entitys = {};
		this.dynamicEntitys = {};
		this.lastId = startLocalId;
		this.poolsManager.clear();
	}

	setIdLocalEntity(id:number)
	{
		this.idLocalEntity = id;
	}

	update(deltaTime:number)
	{
		this.poolsManager.update(deltaTime);
	}

}