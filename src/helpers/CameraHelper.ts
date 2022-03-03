import {Vector2, Vector3} from 'three';
import {BaseHelper} from './BaseHelper';

/*
	рывок камеры при прохождении границы будет если во-первых при deltaStep не учтен deltaTime
	а во-вторых если кружится возле границы взад и вперед то при маленькой cameraSpeed она будет плавно двигаться назад
	соответственно рывок, а значит нужно увеличить ее скорость.
*/

export class CameraHelper extends BaseHelper{
	public static instance:CameraHelper;
	private readonly lookingAt:Vector2 = new Vector2();
	public readonly bgPhase:Vector2 = new Vector2();
	public readonly bgOffset:Vector2 = new Vector2();

	constructor()
	{
		super();
		CameraHelper.instance = this;
	}

	private centerCamera(x:number, y:number)
	{
		this.gs.camera.position.set(x, y, this.gs.camera.position.z );
		this.lookingAt.set(x,y)
	}

	doCam(cameraTarget:Vector2|Vector3, deltaTime:number, deltaStep:Vector2|Vector3)
	{
		deltaStep.multiplyScalar(deltaTime); // если вдруг шаг движения не нормализован, умножив на дельту

		var dir = new Vector2(cameraTarget.x, cameraTarget.y).sub(this.lookingAt);
		var dst = new Vector2();
		const worldWidth = this.gs.settings.worldSize!.x;
		const worldHeight = this.gs.settings.worldSize!.y;
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
			dst.x = this.lookingAt.x + dir.x * this.gs.settings.cameraSpeed! * deltaTime;

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
			dst.y = this.lookingAt.y + dir.y * this.gs.settings.cameraSpeed! * deltaTime;


		this.centerCamera(dst.x, dst.y);

	}
}