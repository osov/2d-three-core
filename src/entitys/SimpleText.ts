import {Mesh} from 'three';
import {BaseMesh} from './BaseMesh';
const {Text} = require('troika-three-text');

export class SimpleText extends BaseMesh{

	protected isMesh = false;
	public readonly mesh:any;

	constructor(text:string, fontUrl:string, fontSize = 16)
	{
		super();
		var mesh = new Text();
		mesh.font = fontUrl;
		mesh.text =  text;
		mesh.fontSize = fontSize;
		mesh.color = 0xf0fff0;
		mesh.sync();
		mesh.anchorX = '50%';
		this.add(mesh);
		this.mesh = mesh;
	}

	setText(text:string)
	{
		this.mesh.text = text;
	}

	makeInstance()
	{
		var copy = new SimpleText(this.mesh.text, this.mesh.font, this.mesh.fontSize);
		this.makeChildsInstance(copy);
		return copy;
	}

	destroy()
	{
		super.destroy();
		this.mesh.dispose();
	}

}