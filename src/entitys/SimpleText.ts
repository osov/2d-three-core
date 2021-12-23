import {Mesh} from 'three';
import {BaseMesh} from './BaseMesh';
const {Text} = require('troika-three-text');

export class SimpleText extends BaseMesh{

	public readonly mesh:Mesh;

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
		this.mesh = mesh;
	}

	setText(text:string)
	{
		(this.mesh as any).text = text;
	}

	clone():SimpleText
	{
		return new SimpleText((this.mesh as any).text, (this.mesh as any).font, (this.mesh as any).fontSize);
	}

}