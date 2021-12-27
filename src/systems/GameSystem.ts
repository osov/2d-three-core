import {Vector2, Vector3, Object3D,Raycaster, Event, EventListener, PointsMaterial} from 'three';
import {RenderSystem, InitParams} from './RenderSystem';
import {CameraHelper} from '../helpers/CameraHelper';
import {WrapHelper, WrapInfo} from '../helpers/WrapHelper';
import {SelectorHelper} from '../helpers/SelectorHelper';
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
	private looperHelper:LooperHelper;

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

		this.cameraHelper.init();
		this.wrapHelper.init();
		this.selectorHelper.init();
		this.looperHelper.init();


		this.wrapHelper.drawDebugBorder(this.scene);
	}

	start()
	{
		this.looperHelper.addEventListener('update', this.updateEvent.bind(this) );
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

	update(deltaTime:number, now:number)
	{
		this.dispatchEvent({type:"onBeforeRender", 'deltaTime': deltaTime, 'now':now});
		this.entitysSystem.update(deltaTime);

		if (this.settings.worldWrap)
			this.wrapHelper.processWrapEntitys(deltaTime);

		this.renderer.render(this.scene, this.camera);

		this.dispatchEvent({type:"onAfterRender", 'deltaTime': deltaTime, 'now':now});
	}
}
