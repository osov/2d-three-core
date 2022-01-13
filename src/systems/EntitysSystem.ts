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
	public wrappedEntitys:{[key: number]: Entity} = {};
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

	addEntity(entity:Entity, pos:Vector3 = new Vector3(), angleDeg:number = 0, parent:Object3D|null = null, id:number = -1, isDynamic:boolean = false)
	{
		if (id == -1)
			id = this.lastId++;
		if (this.entitys[id])
		{
			console.warn("Сущность с таким ид существует", id, this.entitys[id]);
			this.remove(this.entitys[id]);
		}
		entity.onAdd(this.renderSystem.params);
		entity.idEntity = id;
		this.entitys[id] = entity;
		if (isDynamic)
			this.dynamicEntitys[id] = entity;
		entity.addToParent(parent === null ? this.renderSystem.scene : parent);
		entity.setPosition(pos);
		entity.setRotationDeg(angleDeg);
		if (isDynamic)
			this.addToWrappedList(entity);
		entity.onAdded();
		this.renderSystem.dispatchEvent({type:'onAddedEntity', entity:entity});
		//console.log('addEntity',entity.prefabName, id);
		return entity;
	}

	addToWrappedList(entity:Entity, isDynamic:boolean = true)
	{
		if (!this.renderSystem.params.worldWrap)
			return;
		if (this.wrappedEntitys[entity.idEntity])
			console.warn("Сущность с таким ид существует в списка wrapped", entity.idEntity);
		if (!isDynamic)
		{
			const cx = this.renderSystem.params.worldSize.x * 0.5 - this.renderSystem.params.viewDistance;
			const cy = this.renderSystem.params.worldSize.y * 0.5 - this.renderSystem.params.viewDistance;
			const pos = entity.getPosition();
			if ((pos.x >= -cx && pos.x <= cx ) &&  (pos.y >= -cy && pos.y <= cy ))
				return;
		}

		this.wrappedEntitys[entity.idEntity] = entity;
	}

	addEntityByName(name:string, pos:Vector3, angleDeg:number = 0, parent:Object3D|null = null, id:number = -1, isDynamic:boolean = false)
	{
		var entity = this.createPrefab(name);
		return this.addEntity(entity, pos, angleDeg, parent, id, isDynamic);
	}

	remove(entity:Entity, isDestroy = false)
	{
		this.renderSystem.dispatchEvent({type:'onBeforeRemoveEntity', entity:entity});
		delete this.entitys[entity.idEntity];
		delete this.dynamicEntitys[entity.idEntity];
		delete this.wrappedEntitys[entity.idEntity];
		entity.onRemove();
		if (isDestroy)
		{
			entity.removeFromParent();
			entity.destroy();
		}
		else
		{
			this.poolsManager.putPoolItem(entity);
		}
	}

	removeById(id:number, isDestroy = false)
	{
		var entity = this.entitys[id];
		if (!entity)
			return console.warn("Сущность для удаления не найдена:",id);
		return this.remove(entity, isDestroy);
	}

	getEntityById(id:number)
	{
		if (this.entitys[id] === undefined)
			return;
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
		this.wrappedEntitys = {};
		this.lastId = startLocalId;
		this.poolsManager.clear();
	}

	update(deltaTime:number)
	{
		this.poolsManager.update(deltaTime);
	}

}