import * as THREE from 'three';
import {SimpleEventEmitter} from '../core/EventEmitter';
import {InputManager} from './InputManager';
import {RenderManager, InitParams} from './RenderManager';


export class GameManager extends RenderManager{

	public selectedObject:THREE.Object3D | null = null;
	public isClickIntersect = false;
	public isMoveIntersect = false;

	private readonly raycaster = new THREE.Raycaster();
	private lastUpdate:number = 0;


	constructor(params:InitParams = {isPerspective:false})
	{
		super(params);

	}

	start()
	{
		this.animate(0);
	}


// ----------------------------------------------------------------------------------------------------------
// INPUT EVENTS
// ----------------------------------------------------------------------------------------------------------

	onMove(clientX = 0,clientY = 0)
	{
		this.setPointers(clientX, clientY);
		if (this.isMoveIntersect)
			this.checkOnIntersect();
		this.emit("onMove", this.mousePos);
	}


	onInputDown(clientX = 0, clientY = 0)
	{
		this.setPointers(clientX, clientY);
		if (this.isClickIntersect)
			this.checkOnIntersect();
		this.emit("onDown", clientX, clientY);
	}

	private checkOnIntersect()
	{
		var pointer = new THREE.Vector2(
			( this.mousePos.x / window.innerWidth ) * 2 - 1,
			- (this.mousePos.y / window.innerHeight ) * 2 + 1
		);
		this.raycaster.setFromCamera( pointer, this.camera );
		const intersects = this.raycaster.intersectObject( this.raycastGroup, true );
		if ( intersects.length > 0 )
		{
			const res = intersects.filter( function ( res ){return res && res.object;})[0];
			if ( res && res.object )
			{
				if (this.selectedObject == res.object)
					return;

				if (this.selectedObject)
					this.onLeaveItem(this.selectedObject);
				this.selectedObject = res.object;
				this.onEnterItem(this.selectedObject);
			}
		}
		else if (this.selectedObject)
		{
			this.onLeaveItem(this.selectedObject);
			this.selectedObject = null;
		}
	}

	onEnterItem(mesh:THREE.Object3D)
	{
		//console.log('enter', mesh);
		this.emit("onEnter", mesh);
	}

	onLeaveItem(mesh:THREE.Object3D)
	{
		//console.log('leave', mesh);
		this.emit("onLeave", mesh);
	}

	pointToScreen(point:THREE.Vector3|THREE.Vector2)
	{
		var w = this.container.clientWidth;
		var h = this.container.clientHeight;
		var widthHalf = w / 2, heightHalf = h / 2;
		var vector = new THREE.Vector3(point.x, point.y, 0);
		vector.project(this.camera);
		vector.x = ( vector.x * widthHalf ) + widthHalf;
		vector.y = -( vector.y * heightHalf ) + heightHalf;
		return new THREE.Vector2(vector.x, vector.y);
	}

	screenToPoint(point:THREE.Vector3|THREE.Vector2)
	{
		var w = this.container.clientWidth;
		var h = this.container.clientHeight;
		var vector = new THREE.Vector3(( point.x / w ) * 2 - 1, -( point.y / h ) * 2 + 1, -1);
		vector = vector.unproject(this.camera);
		return vector;
	}


// ----------------------------------------------------------------------------------------------------------
// Core
// ----------------------------------------------------------------------------------------------------------

	doFull()
	{
		this.container.requestFullscreen();
	}

	animate(now:number)
	{
		const dt = now - this.lastUpdate;
		this.lastUpdate = now;
		this.update(dt, now);
		requestAnimationFrame(this.animate.bind(this));
	}

	update(dt:number, now:number)
	{
		this.emit("onBeforeRender", dt, now);
		this.renderer.render(this.scene, this.camera);
		this.emit("onAfterRender", dt, now);
	}
}
