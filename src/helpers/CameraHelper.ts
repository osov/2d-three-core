import {Vector2, Vector3} from 'three';
import {BaseHelper} from './BaseHelper';
import {GameSystem} from '../systems/GameSystem';

/*
	рывок камеры при прохождении границы будет если во-первых при deltaStep не учтен deltaTime
	а во-вторых если кружится возле границы взад и вперед то при маленькой cameraSpeed она будет плавно двигаться назад
	соответственно рывок, а значит нужно увеличить ее скорость.
*/

export class CameraHelper extends BaseHelper{

	private readonly lookingAt:Vector2 = new Vector2();
	public readonly bgPhase:Vector2 = new Vector2();
	public readonly bgOffset:Vector2 = new Vector2();

	constructor(gm:GameSystem)
	{
		super(gm);
	}

	private centerCamera(x:number, y:number)
	{
		this.gm.camera.position.set(x, y, this.gm.camera.position.z );
		this.lookingAt.set(x,y)
	}

	doCam(cameraTarget:Vector2|Vector3, deltaTime:number, deltaStep:Vector2|Vector3)
	{
		deltaStep.multiplyScalar(deltaTime); // если вдруг шаг движения не нормализован, умножив на дельту

		var dir = new Vector2(cameraTarget.x, cameraTarget.y).sub(this.lookingAt);
		var dst = new Vector2();
		const worldWidth = this.gm.settings.worldWidth;
		const worldHeight = this.gm.settings.worldHeight;
		// ось Х
		if (dir.x > worldWidth * 0.5)
		{
			dst.x = this.lookingAt.x + worldWidth + deltaStep.x;
			this.bgPhase.x +=1;
		}
		else if (dir.x < -worldWidth * 0.5)
		{
			dst.x = this.lookingAt.x - worldWidth + deltaStep.x;
			this.bgPhase.x -=1;
		}
		else
			dst.x = this.lookingAt.x + dir.x * this.gm.settings.cameraSpeed * deltaTime;

		// ось Y
		if (dir.y > worldHeight * 0.5)
		{
			dst.y = this.lookingAt.y + worldHeight + deltaStep.y;
			this.bgPhase.y +=1;
		}
		else if (dir.y < -worldHeight * 0.5)
		{
			dst.y = this.lookingAt.y - worldHeight + deltaStep.y;
			this.bgPhase.y -=1;
		}
		else
			dst.y = this.lookingAt.y + dir.y * this.gm.settings.cameraSpeed * deltaTime;

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

		this.centerCamera(dst.x, dst.y);

		//this.world.dispatchEvent({"type": 'bgOffset', "x":ox, "y":oy});
		
		//this.bgOffset.x = ox;
		//this.bgOffset.y = oy;
	}
}