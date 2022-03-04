import { Vector2, Vector3, Event, PointsMaterial, Object3D } from 'three';
import { RenderSystem, InitParams } from './RenderSystem';
import { CameraHelper } from '../helpers/CameraHelper';
import { WrapHelper, WrapInfo } from '../helpers/WrapHelper';
import { SelectorHelper } from '../helpers/SelectorHelper';
import { MouseInputHelper } from '../helpers/MouseInputHelper';
import { LooperHelper, EventUpdate } from '../helpers/LooperHelper';
import { Entity } from '../entitys/Entity';
import * as gUtils from '../core/gameUtils';
import { MasterPool } from '../pool/MasterPool';
import { SceneHelper } from '../helpers/SceneHelper';
import * as TWEEN from '@tweenjs/tween.js';

interface WorldSettings {
	worldWrap?: boolean;
	worldSize?: Vector2;
	viewDistance?: number;
	cameraSpeed?: number;
	fontUrl: string;
}

export class GameSystem extends RenderSystem {
	public static instance:GameSystem;
	public intervalStaticUpdate:number = 100;
	public settings: WorldSettings;
	public cameraHelper: CameraHelper;
	public wrapHelper: WrapHelper;
	public selectorHelper: SelectorHelper;
	public mouseHelper: MouseInputHelper;
	private looperHelper: LooperHelper;
	public idLocalEntity: number = -1;
	private wrapInfo: WrapInfo;
	private lastStaticUpdate: number = 0;


	constructor(params: InitParams = { isPerspective: false, worldWrap: false, worldSize: new Vector2(1, 1), viewDistance: 1 }) {
		super(params);
		GameSystem.instance = this;
	}

	async init(settings: WorldSettings) {
		this.settings = settings;
		await super.initRender(settings.fontUrl);
		this.looperHelper = new LooperHelper();
		this.cameraHelper = new CameraHelper();
		this.wrapHelper = new WrapHelper();
		this.selectorHelper = new SelectorHelper();
		this.mouseHelper = new MouseInputHelper();

		this.looperHelper.init();
		this.mouseHelper.init();
		this.cameraHelper.init();
		this.wrapHelper.init();
		this.selectorHelper.init();

		//this.wrapHelper.drawDebugBorder(this.scene);
		new MasterPool();
		new SceneHelper().init();
	}

	start() {
		this.looperHelper.addEventListener('update', this.updateEvent.bind(this));
		this.looperHelper.addEventListener('updateTimeout', this.updateEventTimeout.bind(this)); // когда нету фокуса, но мы хотим крутить события
	}

	// ----------------------------------------------------------------------------------------------------------
	// Core
	// ----------------------------------------------------------------------------------------------------------
	addByName(mesh:Object3D, name:string)
	{
		mesh.name = name;
		this.scene.add(mesh);
	}

	addToRaycast(entity: Entity) {
		this.selectorHelper.add(entity)
	}

	clearScene(fullClear = true) {
		super.clearScene(fullClear);
		this.selectorHelper.clear();
	}

	pointToScreen(point: Vector3 | Vector2) {
		return gUtils.pointToScreen(point, this.camera, this.container);
	}

	screenToPoint(point: Vector3 | Vector2) {
		return gUtils.screenToPoint(point, this.camera, this.container);
	}

	getWrapInfo() {
		return this.wrapHelper.getWrapInfo(this.camera.position);
	}

	getWrapPos(wrapData: WrapInfo, pos: Vector2 | Vector3) {
		return this.wrapHelper.getWrapPos(wrapData, pos);
	}

	getWrapPosBorder(pos: Vector2 | Vector3) {
		return this.wrapHelper.getWrapPosBorder(this.getWrapInfo(), pos);
	}

	wrapPosition(pos: Vector2 | Vector3) {
		return this.wrapHelper.wrapPosition(pos);
	}

	registerParticlePool(name: string, material: PointsMaterial, maxCount: number) {
		return this.entitysSystem.registerParticlePool(name, material, maxCount);
	}

	registerPrefab(name: string, prefab: Entity) {
		return this.entitysSystem.registerPrefab(name, prefab);
	}

	setIdLocalEntity(id: number) {
		this.idLocalEntity = id;
	}

	updateEvent(event: Event) {
		var e = event as EventUpdate;
		this.update(e.deltaTime, e.now);
	}

	// в первую очередь чтобы крутануть сетевые события.
	updateEventTimeout(event: Event) {
		var e = event as EventUpdate;
		this.dispatchEvent({ type: 'onBeforeRender', deltaTime: e.deltaTime, now: e.now });
		this.dispatchEvent({ type: 'onAfterRender', deltaTime: e.deltaTime, now: e.now });
	}

	// Очередь обработки: network, time system, pool, wrap, render
	update(deltaTime: number, now: number) {
		TWEEN.update();
		this.dispatchEvent({ type: 'onBeforeRender', deltaTime, now });
		this.entitysSystem.update(deltaTime);

		var pos = new Vector3();

		// делаем заранее рассчет позиции локального, иначе если юзер объект будет ниже по списку сущностей,
		// то при переходе границы будет мерцание, т.к. до него переместится объект раньше/позже
		var localEntity = this.entitysSystem.entitys[this.idLocalEntity];
		if (localEntity) {
			localEntity.doUpdate(deltaTime);
			this.dispatchEvent({ type: 'onLocalUserUpdate', entity: localEntity, deltaTime });
		}

		if (this.settings.worldWrap)
			this.wrapInfo = this.getWrapInfo();

		// dynamic
		for (var id in this.entitysSystem.dynamicEntitys) {
			if (Number(id) == this.idLocalEntity)
				continue;

			var entity = this.entitysSystem.dynamicEntitys[id];
			entity.doUpdate(deltaTime);

			if (this.settings.worldWrap && !this.entitysSystem.notWrappedIds.has(Number(id))) {
				pos.copy(entity.getPosition());
				this.getWrapPos(this.wrapInfo, pos);
				entity.setPositionXY(pos.x, pos.y);
			}
		}

		var isUpd = false;
		if (localEntity) {
			const minRange = 200;
			const _pos = localEntity.getPosition();
			var dx = this.params.worldSize!.x * 0.5 - Math.abs(_pos.x);
			var dy = this.params.worldSize!.y * 0.5 - Math.abs(_pos.y);
			isUpd = dx < minRange || dy < minRange;
		}

		// static
		const _now = Date.now();
		if (isUpd || _now > this.lastStaticUpdate) {
			deltaTime = _now - this.lastStaticUpdate;
			this.lastStaticUpdate = _now + this.intervalStaticUpdate;

			for (var id in this.entitysSystem.staticEntitys) {
				if (Number(id) == this.idLocalEntity)
					continue;

				var entity = this.entitysSystem.staticEntitys[id];
				entity.doUpdate(deltaTime);

				if (this.settings.worldWrap && !this.entitysSystem.notWrappedIds.has(Number(id))) {
					pos.copy(entity.getPosition());
					this.getWrapPos(this.wrapInfo, pos);
					entity.setPositionXY(pos.x, pos.y);
				}
			}
		}
		
		this.renderer.clear()
		this.renderer.render(this.scene, this.camera);
		this.renderer.clearDepth();
		this.renderer.render( this.sceneOrtho, this.cameraOrtho);
		this.dispatchEvent({ type: 'onAfterRender', deltaTime, now });
	}



}
