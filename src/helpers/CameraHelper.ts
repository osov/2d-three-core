import {Vector2, Vector3} from 'three';
import {BaseHelper} from './BaseHelper';

export class CameraHelper extends BaseHelper{

	private lookingAt:Vector2 = new Vector2();
	public readonly bgPhase:Vector2 = new Vector2();
	public readonly bgOffset:Vector2 = new Vector2();

	constructor(v:any)
	{
		super(v);
	}

	private centerCamera(x:number, y:number)
	{
		this.gm.camera.position.set(x, y, this.gm.camera.position.z );
		this.lookingAt.x = x;
		this.lookingAt.y = y;
	}

	doCam(cameraTarget:Vector2|Vector3, deltaTime:number, deltaStep:Vector2|Vector3)
	{
		let lookingAtDeltaX = cameraTarget.x - this.lookingAt.x;
		let lookingAtDeltaY = cameraTarget.y - this.lookingAt.y;
		let cameraTempTargetX = 0;
		let cameraTempTargetY = 0;
		const worldWidth = this.gm.settings.worldWidth;
		const worldHeight = this.gm.settings.worldHeight;

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
			cameraTempTargetX = this.lookingAt.x + lookingAtDeltaX * this.gm.settings.cameraSpeed * deltaTime;

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
			cameraTempTargetY = this.lookingAt.y + lookingAtDeltaY * this.gm.settings.cameraSpeed * deltaTime;

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