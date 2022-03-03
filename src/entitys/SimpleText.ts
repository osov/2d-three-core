import { ResourceSystem } from 'ecs-threejs';
import {BaseMesh} from './BaseMesh';
const TroikaText = require('troika-three-text');

export class SimpleText extends BaseMesh{

	protected className = 'SimpleText';
	protected text = '';
	protected isMesh = false;
	public readonly mesh:any;
	private curColor:string;

	constructor(text:string, fontSize = 16)
	{
		super();
		var mesh = new TroikaText.Text();
		mesh.font = ResourceSystem.instance.getLoadedFont();
		mesh.text =  text;
		mesh.fontSize = fontSize;
		mesh.anchorX = '50%';
		mesh.anchorY = '50%';
		this.add(mesh);
		this.mesh = mesh;
		this.text = text;
		this.setColor('#f0fff0');
	}

	HEXToVBColor(rrggbb:string) {
		var bbggrr = rrggbb.substring(1);
		return parseInt(bbggrr, 16);
	}

	setColor(color:string, alpha = 1)
	{
		this.curColor = color;
		if (color.length > 7){
			alpha = parseInt(color.substr(7,2), 16)/255;
			color = color.substr(0,7);
		}
		this.mesh.color = this.HEXToVBColor(color);
		this.mesh.fillOpacity = alpha;
		this.mesh.sync();
	}

	setText(text:string)
	{
		this.text = text;
		this.mesh.text = text;
	}

	makeInstance()
	{
		var copy = new SimpleText(this.mesh.text,  this.mesh.fontSize);
		copy.setColor(this.curColor);
		this.makeChildsInstance(copy);
		return copy;
	}

	destroy()
	{
		super.destroy();
		this.mesh.dispose();
	}

}