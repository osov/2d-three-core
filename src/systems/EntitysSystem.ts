import { Vector3, Object3D, PointsMaterial } from 'three';
import { BaseSystem } from './BaseSystem';
import { RenderSystem } from './RenderSystem';
import { Entity } from '../entitys/Entity';
import { PlaneSprite } from '../entitys/PlaneSprite';
import { PoolsManager } from '../pool/PoolsManager';

const startLocalId = 65535;

export class EntitysSystem extends BaseSystem {

	public static instance:EntitysSystem;
	public entitys: { [key: number]: Entity } = {};
	public dynamicEntitys: { [key: number]: Entity } = {};
	public staticEntitys: { [key: number]: Entity } = {};
	public notWrappedIds:Set<number> = new Set();
	private lastId: number = startLocalId;
	private renderSystem: RenderSystem;
	private poolsManager: PoolsManager;

	constructor() {
		super();
		EntitysSystem.instance = this;
		this.renderSystem = RenderSystem.instance;
		this.poolsManager = new PoolsManager();
		
	}

	private createBadEntity() {
		var entity = new PlaneSprite(this.renderSystem.resourceSystem.getMaterial('bad'));
		return entity;
	}

	registerPrefab(name: string, prefab: Entity) {
		return this.poolsManager.registerObjectsPool(name, prefab)
	}

	registerParticlePool(name: string, material: PointsMaterial, maxCount: number) {
		return this.poolsManager.registerParticlesPool(name, material, maxCount)
	}

	private createPrefab(name: string) {
		var entity: Entity;
		if (!this.poolsManager.hasPool(name)) {
			this.warn("Префаб не зарегистрирован:", name);
			entity = this.createBadEntity();
		}
		else {
			entity = this.poolsManager.getPoolItem(name);
			entity.prefabName = name;
		}
		return entity;
	}

	addEntity(entity: Entity, pos: Vector3 = new Vector3(), angleDeg: number = 0, isDynamic: boolean = false, parent: Object3D | null = null, id: number = -1) {
		if (id == -1)
			id = this.lastId++;
		if (this.entitys[id]) {
			this.warn("Сущность с таким ид существует", id, this.entitys[id]);
			this.remove(this.entitys[id]);
		}
		entity.onBeforeAdd();
		entity.idEntity = id;
		this.entitys[id] = entity;
		if (isDynamic)
			this.dynamicEntitys[id] = entity;
		else
			this.staticEntitys[id] = entity;
		entity.addToParent(parent === null ? this.renderSystem.scene : parent);
		entity.setPosition(pos);
		entity.setRotationDeg(angleDeg);
		this.addToWrappedList(entity, isDynamic);
		entity.onAfterAdd();
		this.renderSystem.dispatchEvent({ type: 'onAddedEntity', entity: entity });
		//console.log('addEntity',entity.prefabName, id);
		return entity;
	}

	addEntityByName(name: string, pos: Vector3, angleDeg: number = 0, isDynamic: boolean = false, parent: Object3D | null = null, id: number = -1) {
		var entity = this.createPrefab(name);
		return this.addEntity(entity, pos, angleDeg, isDynamic, parent, id);
	}

	private addToWrappedList(entity: Entity, isDynamic: boolean = true) {
		if (!this.renderSystem.params.worldWrap)
			return;
		const cx = this.renderSystem.params.worldSize!.x * 0.5 - this.renderSystem.params.viewDistance!;
		const cy = this.renderSystem.params.worldSize!.y * 0.5 - this.renderSystem.params.viewDistance!;
		if (!isDynamic) {
			const pos = entity.getPosition();
			if ((pos.x >= -cx && pos.x <= cx) && (pos.y >= -cy && pos.y <= cy))
				return this.notWrappedIds.add(entity.idEntity);
		}
	}

	remove(entity: Entity, isDestroy = false) {
		this.renderSystem.dispatchEvent({ type: 'onBeforeRemoveEntity', entity: entity });
		delete this.entitys[entity.idEntity];
		delete this.dynamicEntitys[entity.idEntity];
		delete this.staticEntitys[entity.idEntity];
		this.notWrappedIds.delete(entity.idEntity);
		entity.onRemove();
		if (isDestroy) {
			entity.removeFromParent();
			entity.destroy();
		}
		else {
			this.poolsManager.putPoolItem(entity);
		}
	}

	removeById(id: number, isDestroy:boolean = false) {
		var entity = this.entitys[id];
		if (!entity)
			return this.warn("Сущность для удаления не найдена:", id);
		return this.remove(entity, isDestroy);
	}

	getEntityById(id: number) {
		if (this.entitys[id] === undefined)
			return;
		else
			return this.entitys[id];
	}


	clearScene(fullClear: boolean = true) {
		for (var id in this.entitys) {
			var e = this.entitys[id];
			this.remove(e, true);
		}
		// в теории метод не нужен если не будет дублей среди сущностей
		if (fullClear) {
			for (var i = this.renderSystem.scene.children.length - 1; i >= 0; i--) {
				var m = this.renderSystem.scene.children[i];
				m.removeFromParent();
				if (m instanceof Entity)
					m.destroy();
			}
		}
		this.entitys = {};
		this.dynamicEntitys = {};
		this.staticEntitys = {};
		this.lastId = startLocalId;
		this.poolsManager.clear();
	}

	update(deltaTime: number) {
		this.poolsManager.update(deltaTime);
	}

}