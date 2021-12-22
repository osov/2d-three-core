import {Vector2, Vector3,  Object3D, Line, LineBasicMaterial, BufferGeometry} from 'three';
import {BaseHelper} from './BaseHelper';

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

export class WrapHelper extends BaseHelper{


	constructor(v:any)
	{
		super(v);
	}

	drawDebugBorder(parent:Object3D)
	{
		const w = this.gm.settings.worldWidth;
		const h = this.gm.settings.worldHeight;

		const z = 0.1;
		const material = new LineBasicMaterial({color: 0x0000ff});

		const points = [];
		points.push( new Vector3( - w/2, h/2, z ) );
		points.push( new Vector3( w/2, h/2, z ) );
		points.push( new Vector3( w/2, -h/2, z ) );
		points.push( new Vector3( -w/2, -h/2, z ) );
		points.push( new Vector3( -w/2, h/2, z ) );

		const geometry = new BufferGeometry().setFromPoints( points );
		const line = new Line( geometry, material );
		parent.add( line );
		return line;
	}

	getWrapInfo(viewer:Vector2|Vector3):WrapInfo
	{
		var world_width = this.gm.settings.worldWidth;
		var world_height = this.gm.settings.worldHeight;
		var p = world_width * 0.5 - this.gm.settings.viewDistance;

		var right_border = p;
		var left_border = -p;
		var right_visible = viewer.x - p;
		var left_visible = -p - viewer.x;

		var lx = -world_width * 0.5 + right_visible;
		var rx =  world_width * 0.5 - left_visible;

		var p = world_height * 0.5 - this.gm.settings.viewDistance;
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


	getWrapPos(wrap_data:WrapInfo, pos:Vector2|Vector3)
	{
		const {world_width, world_height,
		right_border,left_border,
		left_visible, right_visible, top_visible, bottom_visible,
		lx, rx, ty, by, viewer_x, viewer_y} = wrap_data;

		if (right_visible > 0 && pos.x < lx)
			pos.x += world_width;
		else if (left_visible > 0 && pos.x > rx)
			pos.x -= world_width;
		else if (viewer_x < right_border && pos.x > world_width * 0.5)
			pos.x -= world_width;
		else if (viewer_x > left_border && pos.x < -world_width * 0.5)
			pos.x += world_width;

		if (top_visible > 0 && pos.y < ty)
			pos.y += world_height;
		else if (bottom_visible > 0 && pos.y > by)
			pos.y -= world_height;
		else if (viewer_y < right_border && pos.y > world_height * 0.5)
			pos.y -= world_height;
		else if (viewer_y > left_border && pos.y < -world_height * 0.5)
			pos.y += world_height;

		return pos;
	}

	getWrapPosBorder(wrap_data:WrapInfo, pos:Vector2|Vector3)
	{
		//return this.getWrapPos(wrap_data, pos);
		var {world_width, world_height, right_border, left_border, top_border, bottom_border, left_visible, right_visible, top_visible, bottom_visible} = wrap_data;
		if (left_visible > 0 && pos.x > right_border)
			pos.x -= world_width;
		if (right_visible > 0 && pos.x < left_border)
			pos.x += world_width;

		if (bottom_visible > 0 && pos.y > top_border)
			pos.y -= world_height;
		if (top_visible > 0 && pos.y < bottom_border)
			pos.y += world_height;
		return pos;
	}

	wrapPosition(pos:Vector2|Vector3)
	{
		const w = this.gm.settings.worldWidth * 0.5;
		const h = this.gm.settings.worldHeight * 0.5;
		if (pos.x >= w)
			pos.x -= 2*w;
		if (pos.x <= -w)
			pos.x += 2*w;
		if (pos.y >= h)
			pos.y -= 2*h;
		if (pos.y <= -h)
			pos.y += 2*h;
		return pos;
	}

}