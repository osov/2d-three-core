import * as THREE from 'three';
import {SimpleEventEmitter} from '../core/EventEmitter';

export interface WrapSettings{
	worldWidth:number;
	worldHeight:number;
	viewDistance:number;
}

export interface WrapInfo {
	world_width:number, 
	world_height:number,

	right_border:number, 
	left_border:number, 
	top_border:number, 
	bottom_border:number,

	left_visible:number,
	right_visible:number,
	top_visible:number,
	bottom_visible:number,

	lx:number,
	rx:number,
	ty:number,
	by:number,

	viewer_x:number,
	viewer_y:number
}

export class WrapHelper extends SimpleEventEmitter{

	private wrapSettings:WrapSettings;

	constructor(camera:THREE.Camera, wrapSettings:WrapSettings)
	{
		super();
		this.wrapSettings = wrapSettings;
	}

	drawDebugBorder(parent:THREE.Object3D)
	{
		const w = this.wrapSettings.worldWidth;
		const h = this.wrapSettings.worldHeight;

		const z = 0.1;
		const material = new THREE.LineBasicMaterial({color: 0x0000ff});

		const points = [];
		points.push( new THREE.Vector3( - w/2, h/2, z ) );
		points.push( new THREE.Vector3( w/2, h/2, z ) );
		points.push( new THREE.Vector3( w/2, -h/2, z ) );
		points.push( new THREE.Vector3( -w/2, -h/2, z ) );
		points.push( new THREE.Vector3( -w/2, h/2, z ) );

		const geometry = new THREE.BufferGeometry().setFromPoints( points );
		const line = new THREE.Line( geometry, material );
		parent.add( line );
		return line;
	}

	getWrapInfo(viewer:THREE.Vector2|THREE.Vector3):WrapInfo
	{
		var world_width = this.wrapSettings.worldWidth;
		var world_height = this.wrapSettings.worldHeight;
		var p = world_width * 0.5 - this.wrapSettings.viewDistance;

		var right_border = p;
		var left_border = -p;
		var right_visible = viewer.x - p;
		var left_visible = -p - viewer.x;

		var lx = -world_width * 0.5 + right_visible;
		var rx =  world_width * 0.5 - left_visible;

		var p = world_height * 0.5 - this.wrapSettings.viewDistance;
		var top_border = p;
		var bottom_border = -p;

		var top_visible = viewer.y - p;
		var bottom_visible = -p - viewer.y;
		var ty = -world_height * 0.5 + top_visible;
		var by =  world_height * 0.5 - bottom_visible;
		var viewer_x = viewer.x;
		var viewer_y = viewer.y;
		return {world_width, world_height,
			right_border, left_border, top_border, bottom_border,
			left_visible, right_visible, top_visible, bottom_visible,
			lx, rx, ty, by,
			viewer_x, viewer_y
		};
	}


	getWrapPos(wrap_data:WrapInfo, pos:THREE.Vector2|THREE.Vector3)
	{
		const {world_width, world_height,
		right_border,left_border,
		left_visible, right_visible, top_visible, bottom_visible,
		lx, rx, ty, by, viewer_x, viewer_y} = wrap_data;

		if (right_visible > 0 && pos.x < lx)
			pos.x += world_width;
		else if (left_visible > 0 && pos.x > rx)
			pos.x -= world_width;
		else if (viewer_x < right_border && pos.x > world_width/2)
			pos.x -= world_width;
		else if (viewer_x > left_border && pos.x < -world_width/2)
			pos.x += world_width;

		if (top_visible > 0 && pos.y < ty)
			pos.y += world_height;
		else if (bottom_visible > 0 && pos.y > by)
			pos.y -= world_height;
		else if (viewer_y < right_border && pos.y > world_height/2)
			pos.y -= world_height;
		else if (viewer_y > left_border && pos.y < -world_height/2)
			pos.y += world_height;

		return pos;
	}

	getWrapPosBorder(wrap_data:WrapInfo, pos:THREE.Vector2|THREE.Vector3)
	{
		return this.getWrapPos(wrap_data, pos);

		/*var {world_width, world_height, right_border, left_border, top_border, bottom_border, left_visible, right_visible, top_visible, bottom_visible} = wrap_data;
		if (left_visible > 0 && pos.x > right_border)
			pos.x -= world_width;
		if (right_visible > 0 && pos.x < left_border)
			pos.x += world_width;

		if (bottom_visible > 0 && pos.y > top_border)
			pos.y -= world_height;
		if (top_visible > 0 && pos.y < bottom_border)
			pos.y += world_height;
		return pos;*/
	}

}