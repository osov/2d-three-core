import {Vector2, Vector3, Object3D,Raycaster, Event, EventListener, PointsMaterial} from 'three';
import {RenderSystem, InitParams} from './RenderSystem';
import {CameraHelper} from '../helpers/CameraHelper';
import {WrapHelper, WrapInfo} from '../helpers/WrapHelper';
import {SelectorHelper} from '../helpers/SelectorHelper';
import {MouseInputHelper} from '../helpers/MouseInputHelper';
import {LooperHelper, EventUpdate} from '../helpers/LooperHelper';
import {Entity} from '../entitys/Entity';
import * as gUtils from '../core/gameUtils';

interface WorldSettings{
	worldWidth:number;
	worldHeight:number;
	worldWrap:boolean;
	viewDistance:number;
	cameraSpeed:number;
	fontUrl:string;
}

export class GameSystem extends RenderSystem{

	public settings:WorldSettings;
	public cameraHelper:CameraHelper;
	public wrapHelper:WrapHelper;
	public selectorHelper:SelectorHelper;
	public mouseHelper:MouseInputHelper;
	private looperHelper:LooperHelper;
	private idLocalEntity:number = -1;
	private wrapInfo:WrapInfo;

	constructor(params:InitParams = {isPerspective:false})
	{
		super(params);
	}

	async init(settings:WorldSettings)
	{
		this.settings = settings;
		await super.initRender(settings.fontUrl);
		this.cameraHelper = new CameraHelper(this);
		this.wrapHelper = new WrapHelper(this);
		this.selectorHelper = new SelectorHelper(this);
		this.looperHelper = new LooperHelper(this);
		this.mouseHelper = new MouseInputHelper(this);

		this.cameraHelper.init();
		this.wrapHelper.init();
		this.selectorHelper.init();
		this.looperHelper.init();


		this.wrapHelper.drawDebugBorder(this.scene);
	}

	start()
	{
		this.looperHelper.addEventListener('update', this.updateEvent.bind(this) );
		this.looperHelper.addEventListener('updateTimeout', this.updateEvent.bind(this) ); // когда нету фокуса, но мы хотим крутить события
	}

	// ----------------------------------------------------------------------------------------------------------
	// Core
	// ----------------------------------------------------------------------------------------------------------

	addToRaycast(entity:Entity)
	{
		this.selectorHelper.add(entity)
	}

	clearScene(fullClear = true)
	{
		super.clearScene(fullClear);
		this.selectorHelper.clear();
	}

	pointToScreen(point:Vector3|Vector2)
	{
		return gUtils.pointToScreen(point, this.camera, this.container);
	}

	screenToPoint(point:Vector3|Vector2)
	{
		return gUtils.screenToPoint(point, this.camera, this.container);
	}

	getWrapInfo()
	{
		return this.wrapHelper.getWrapInfo(this.camera.position);
	}

	getWrapPos(wrapData:WrapInfo, pos:Vector2|Vector3)
	{
		return this.wrapHelper.getWrapPos(wrapData, pos);
	}

	getWrapPosBorder(pos:Vector2|Vector3)
	{
		return this.wrapHelper.getWrapPosBorder(this.getWrapInfo(), pos);
	}

	wrapPosition(pos:Vector2|Vector3)
	{
		return this.wrapHelper.wrapPosition(pos);
	}

	registerParticlePool(name:string, material:PointsMaterial, maxCount:number)
	{
		return this.entitysSystem.registerParticlePool(name, material, maxCount);
	}

	registerPrefab(name:string, prefab:Entity)
	{
		return this.entitysSystem.registerPrefab(name, prefab);
	}

	doFull()
	{
		this.container.requestFullscreen();
	}

	updateEvent(event:Event)
	{
		var e = event as EventUpdate;
		this.update(e.deltaTime, e.now);
	}

	// Очередь обработки: network, time system, pool, wrap, render
	update(deltaTime:number, now:number)
	{
		this.dispatchEvent({type:'onBeforeRender', deltaTime, now});
		this.entitysSystem.update(deltaTime);

		var pos = new Vector3();

		// делаем заранее рассчет позиции локального, иначе если юзер объект будет ниже по списку сущностей,
		// то при переходе границы будет мерцание, т.к. до него переместится объект раньше/позже
		var localEntity = this.entitysSystem.entitys[this.idLocalEntity];
		if (localEntity)
		{
			localEntity.doUpdate(deltaTime);
			this.dispatchEvent({type:'onLocalUserUpdate', entity:localEntity, deltaTime});
		}

		if (this.settings.worldWrap)
			this.wrapInfo = this.getWrapInfo();

		for (var id in this.entitysSystem.entitys)
		{
			if (Number(id) == this.idLocalEntity)
				continue;
			var entity = this.entitysSystem.entitys[id];
			entity.doUpdate(deltaTime);

			if (this.settings.worldWrap)
			{
				pos.copy(entity.getPosition());
				this.getWrapPos(this.wrapInfo, pos);
				entity.setPositionXY(pos.x, pos.y);
			}
		}

		if (this.looperHelper.isVisible())
			this.renderer.render(this.scene, this.camera);

		this.dispatchEvent({type:'onAfterRender', deltaTime, now});
	}

	setIdLocalEntity(id:number)
	{
		this.idLocalEntity = id;
	}
}
