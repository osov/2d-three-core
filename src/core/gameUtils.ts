import {Vector2, Vector3, Camera} from 'three';

export const deepPosition = new Vector3(9999999,9999999);

export function pointToScreen(point:Vector3|Vector2, camera:Camera, container:HTMLElement)
{
	var w = container.clientWidth;
	var h = container.clientHeight;
	var widthHalf = w / 2, heightHalf = h / 2;
	var vector = new Vector3(point.x, point.y, 0);
	vector.project(camera);
	vector.x = ( vector.x * widthHalf ) + widthHalf;
	vector.y = -( vector.y * heightHalf ) + heightHalf;
	return new Vector2(vector.x, vector.y);
}

export function screenToPoint(point:Vector3|Vector2, camera:Camera, container:HTMLElement)
{
	var w = container.clientWidth;
	var h = container.clientHeight;
	var vector = new Vector3(( point.x / w ) * 2 - 1, ( point.y / h ) * 2 - 1, -1);
	vector = vector.unproject(camera);
	return vector;
}

export function getAngleBetweenPoints(p1:Vector2|Vector3, p2:Vector2|Vector3):number
{
	var delta = new Vector2(p1.x, p1.y).sub(new Vector2(p2.x, p2.y));
	var angle = Math.atan2(delta.x, delta.y);
	if (angle < 0)
		angle += 2 * Math.PI;
	return angle;
}