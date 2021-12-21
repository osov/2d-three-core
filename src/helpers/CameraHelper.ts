import * as THREE from 'three';
import {SimpleEventEmitter} from '../core/EventEmitter';

export interface CameraSettings{
	worldWidth:number;
	worldHeight:number;
	cameraSpeed:number;
}

export class CameraHelper extends SimpleEventEmitter{

	private lookingAt:THREE.Vector2 = new THREE.Vector2();
	private camera:THREE.Camera;
	private settings:CameraSettings;
	public readonly bgPhase:THREE.Vector2 = new THREE.Vector2();
	public readonly bgOffset:THREE.Vector2 = new THREE.Vector2();

	constructor(camera:THREE.Camera, settings:CameraSettings)
	{
		super();
		this.camera = camera;
		this.settings = settings;
	}

	centerCamera(x:number, y:number)
	{
		this.camera.position.set(x, y, this.camera.position.z );
		this.lookingAt.x = x;
		this.lookingAt.y = y;
	}

	doCam(cameraTarget:THREE.Vector2|THREE.Vector3, deltaTime:number, deltaStep:THREE.Vector2|THREE.Vector3)
	{
		let lookingAtDeltaX = cameraTarget.x - this.lookingAt.x;
		let lookingAtDeltaY = cameraTarget.y - this.lookingAt.y;
		let cameraTempTargetX = 0;
		let cameraTempTargetY = 0;
		const worldWidth = this.settings.worldWidth;
		const worldHeight = this.settings.worldHeight;

		if (lookingAtDeltaX > worldWidth / 2)
		{
			cameraTempTargetX = this.lookingAt.x + worldWidth + deltaStep.x;
			this.bgPhase.x +=1;
		}
		else if (lookingAtDeltaX < -worldWidth / 2)
		{
			cameraTempTargetX = this.lookingAt.x - worldWidth + deltaStep.x;
			this.bgPhase.x -=1;
		}
		else
			cameraTempTargetX = this.lookingAt.x + lookingAtDeltaX * this.settings.cameraSpeed * deltaTime;

		if (lookingAtDeltaY > worldHeight / 2)
		{
			cameraTempTargetY = this.lookingAt.y + worldHeight + deltaStep.y;
			this.bgPhase.y +=1;
		}
		else if (lookingAtDeltaY < -worldHeight / 2)
		{
			cameraTempTargetY = this.lookingAt.y - worldHeight + deltaStep.y;
			this.bgPhase.y -=1;
		}
		else
			cameraTempTargetY = this.lookingAt.y + lookingAtDeltaY * this.settings.cameraSpeed * deltaTime;

		/*var bgOffsetX = this.bgPhase.x * worldWidth + this.camera.position.x;
		var bgOffsetY = this.bgPhase.y * worldHeight + this.camera.position.y;

		var ox = cameraTempTargetX - this.camera.position.x;
		if (ox > 1)
			ox = this.bgOffset.x;
		if (ox < -1)
			ox = this.bgOffset.x;

		var oy = cameraTempTargetY - this.camera.position.y;
		if (oy > 1)
			oy = this.bgOffset.y;
		if (oy < -1)
			oy = this.bgOffset.y;*/

		this.centerCamera(cameraTempTargetX, cameraTempTargetY);

		//this.world.dispatchEvent({"type": 'bgOffset', "x":ox, "y":oy});
		
		//this.bgOffset.x = ox;
		//this.bgOffset.y = oy;
	}
}