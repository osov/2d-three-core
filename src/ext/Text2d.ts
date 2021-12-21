import * as THREE from 'three';

enum TextAlign {
    center,
    left,
    top,
    topLeft,
    topRight,
    right,
	bottom,
	bottomLeft,
	bottomRight
}

const textAlign = [
	new THREE.Vector2(0, 0),
	 new THREE.Vector2(1, 0),
	new THREE.Vector2(0, -1),
	 new THREE.Vector2(1, -1),
	 new THREE.Vector2(-1, -1),
	 new THREE.Vector2(-1, 0),
	 new THREE.Vector2(0, 1),
	new THREE.Vector2(1, 1),
	 new THREE.Vector2(-1, 1),
];

interface TextOptions{
	font?: string,
	fillStyle?: string,
	shadowBlur?: number,
	shadowColor?: string,
	shadowOffsetX?: number,
	shadowOffsetY?: number,
	lineHeight?: number,
	align?: TextAlign,
	backgroundColor?: string,
	horizontalPadding?: number,
	verticalPadding?: number,
	side?:THREE.Side,
	antialias?:boolean,
	isSprite?:boolean,
}




const fontHeightCache:{[key:string]:number;} = {};

class CanvasText
{
	public textWidth:number|null;
	public textHeight:number|null;
	public canvas:HTMLCanvasElement;
	public ctx:CanvasRenderingContext2D|null;

	constructor()
	{
		this.textWidth = null;
		this.textHeight = null;
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
	}

	getFontHeight(fontStyle:string)
	{
		var result = fontHeightCache[fontStyle];
		if (!result)
		{
			var body = document.getElementsByTagName('body')[0];
			var dummy = document.createElement('div');
			var dummyText = document.createTextNode('MÉq');
			dummy.appendChild(dummyText);
			dummy.setAttribute('style', "font:" + fontStyle + ";position:absolute;top:0;left:0");
			body.appendChild(dummy);
			result = dummy.offsetHeight;
			fontHeightCache[fontStyle] = result;
			body.removeChild(dummy);
		}
		return result;
	}

	drawText(text:string, ctxOptions:TextOptions)
	{
		var _this = this;
		if (!this.ctx)
			return;
		if (!ctxOptions.font || !ctxOptions.lineHeight || !ctxOptions.horizontalPadding || !ctxOptions.verticalPadding ||
			!ctxOptions.fillStyle || !ctxOptions.align || !ctxOptions.shadowColor || !ctxOptions.shadowBlur || !ctxOptions.shadowOffsetX || !ctxOptions.shadowOffsetY)
			return;

		this.ctx.font = ctxOptions.font;
		var lineHeight = this.getFontHeight(ctxOptions.font);
		var lines = (text || "").toString().split("\n");
		this.textWidth = Math.max.apply(null, lines.map(function (line)
		{
			if (!_this.ctx)
				return 0;
			return Math.ceil(_this.ctx.measureText(line).width);
		}));
		this.textHeight = lineHeight + lineHeight * ctxOptions.lineHeight * (lines.length - 1);
		// 2 = prevent canvas being 0 size when using empty / null text
		this.canvas.width = Math.max(2, THREE.MathUtils.ceilPowerOfTwo(this.textWidth + (2 * ctxOptions.horizontalPadding)));
		this.canvas.height = Math.max(2, THREE.MathUtils.ceilPowerOfTwo(this.textHeight + (2 * ctxOptions.verticalPadding)));
		this.ctx.font = ctxOptions.font;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if (ctxOptions.backgroundColor)
		{
			this.ctx.fillStyle = ctxOptions.backgroundColor;
			this.ctx.fillRect(0, 0, this.textWidth + (2 * ctxOptions.horizontalPadding), this.textHeight + (2 * ctxOptions.verticalPadding));
		}
		this.ctx.fillStyle = ctxOptions.fillStyle;
		var align = textAlign[ctxOptions.align];
		if (!(align instanceof THREE.Vector2))
			return;
		if (align.x === 1)
			this.ctx.textAlign = 'left';
		else if (align.x === 0)
			this.ctx.textAlign = 'center';
		else
			this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'top';
		this.ctx.shadowColor = ctxOptions.shadowColor;
		this.ctx.shadowBlur = ctxOptions.shadowBlur;
		this.ctx.shadowOffsetX = ctxOptions.shadowOffsetX;
		this.ctx.shadowOffsetY = ctxOptions.shadowOffsetY;
		var x = this.textWidth * (0.5 - align.x * 0.5);
		var y = 0.5 * ((lineHeight * ctxOptions.lineHeight) - lineHeight);
		for (var i = 0; i < lines.length; i++)
			this.ctx.fillText(lines[i], x + ctxOptions.horizontalPadding, (lineHeight * ctxOptions.lineHeight * i) + ctxOptions.verticalPadding + y);
		return this.canvas;
	}
}


export class Text2D extends THREE.Object3D
{
	private _font:string;
	private _fillStyle:string;
	private _shadowColor:string;
	private _shadowBlur:number;
	private _shadowOffsetX:number;
	private _shadowOffsetY:number;
	private _lineHeight:number;
	private _backgroundColor:string;
	private _horizontalPadding:number;
	private _verticalPadding:number;
	private _canvas:CanvasText;
	private _align:TextAlign;
	private _side:THREE.Side;
	private _antialias:boolean;
	private _text:string;
	private isSprite:boolean;
	private params:any;
	private texture:THREE.Texture|null = null;
	private material:THREE.SpriteMaterial|THREE.MeshBasicMaterial|null = null;
	private sprite:THREE.Sprite|null = null;
	private geometry:THREE.PlaneGeometry|null = null;
	private mesh:THREE.Mesh|null = null;

	constructor(text:string, options:TextOptions)
	{
		super();
		this.type = 'Text2D';
		this._font = options.font || '30px Arial';
		this._fillStyle = options.fillStyle || '#FFFFFF';
		this._shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0)';
		this._shadowBlur = options.shadowBlur || 0;
		this._shadowOffsetX = options.shadowOffsetX || 0;
		this._shadowOffsetY = options.shadowOffsetY || 0;
		this._lineHeight = options.lineHeight || 1.2;
		this._backgroundColor = options.backgroundColor || 'transparent';
		this._horizontalPadding = options.horizontalPadding || 0;
		this._verticalPadding = options.verticalPadding || 0;
		this._canvas = new CanvasText();
		this._align = options.align || TextAlign.center;
		this._side = options.side || THREE.FrontSide;
		this._antialias = (typeof options.antialias === "undefined") ? true : options.antialias;
		this._text = text;
		this.isSprite = options.isSprite !== undefined ? options.isSprite : true;
		this.updateText();
		this.params = {'text': 'Надпись', 'font_name':'Arial', 'font_size':'30px', 'font_color':0xffffff, 'bg_color':0, 'align':TextAlign.center,
		'shadow_color':0,'shadow_blur':0,'shadow_x':0,'shadow_y':0, 'antialias':true};
	}

	setText(text:string)
	{
		this._text = text;
		this.updateText();
	}

	cleanUp()
	{
		if (this.texture)
			this.texture.dispose();
	}

	applyAntiAlias()
	{
		if (this._antialias === false && this.texture)
		{
			this.texture.magFilter = THREE.NearestFilter;
			this.texture.minFilter = THREE.LinearMipMapLinearFilter;
		}
	}

	updateText()
	{
		this._canvas.drawText(this._text, {
			font: this._font,
			fillStyle: this._fillStyle,
			shadowBlur: this._shadowBlur,
			shadowColor: this._shadowColor,
			shadowOffsetX: this._shadowOffsetX,
			shadowOffsetY: this._shadowOffsetY,
			lineHeight: this._lineHeight,
			align: this._align,
			backgroundColor: this._backgroundColor,
			horizontalPadding: this._horizontalPadding,
			verticalPadding: this._verticalPadding
		});
		// cleanup previous texture
		this.cleanUp();
		this.texture = new THREE.Texture(this._canvas.canvas);
		this.texture.needsUpdate = true;
		this.applyAntiAlias();
		if (this.isSprite)
		{
			if (!this.material)
				this.material = new THREE.SpriteMaterial({ map: this.texture, depthTest:false });
			else
				this.material.map = this.texture;
			if (!this.sprite && this.material instanceof THREE.SpriteMaterial)
			{
				this.sprite = new THREE.Sprite(this.material);
				this.add(this.sprite);
			}
			var max = Math.max(this._canvas.canvas.width, this._canvas.canvas.height);
			var p = this._canvas.canvas.width/this._canvas.canvas.height/2;
			if (p < 0.5)
				p = 0.5;
			if (this.sprite)
				this.sprite.scale.set(this._canvas.canvas.width / max * p, this._canvas.canvas.height / max * p, 1);
		}
		else
		{
			if (!this.material)
			{
				this.material = new THREE.MeshBasicMaterial({ map: this.texture, side: this._side, depthTest:false });
				this.material.transparent = true;
			}
			else
				this.material.map = this.texture;
			if (!this.mesh)
			{
				this.geometry = new THREE.PlaneGeometry(this._canvas.canvas.width, this._canvas.canvas.height);
				this.mesh = new THREE.Mesh(this.geometry, this.material);
				this.add(this.mesh);
			}
			if (this._canvas && this._canvas.textWidth && this._canvas.textHeight && this.geometry)
			{
				var vertices = this.geometry.getAttribute("position") as THREE.BufferAttribute;
				var align = textAlign[this._align];
				this.mesh.position.x = ((this._canvas.canvas.width / 2) - (this._canvas.textWidth / 2)) + ((this._canvas.textWidth / 2) * align.x);
				this.mesh.position.y = (-this._canvas.canvas.height / 2) + ((this._canvas.textHeight / 2) * align.y);
				vertices.setX(0, this._canvas.canvas.width / 2);
				vertices.setX(2, this._canvas.canvas.width / 2);
				vertices.setX(1, -this._canvas.canvas.width / 2);
				vertices.setX(3, -this._canvas.canvas.width / 2);
				vertices.setY(0, this._canvas.canvas.height / 2);
				vertices.setY(1, this._canvas.canvas.height / 2);
				vertices.setY(2, -this._canvas.canvas.height / 2);
				vertices.setY(3, -this._canvas.canvas.height / 2);
				vertices.needsUpdate = true;
			}
		}
		this.updateAlign();
	}

	updateAlign()
	{
		if (this.sprite && this._canvas.textWidth && this._canvas.textHeight)
		{
			var align = textAlign[this._align];
			this.sprite.center.x = (0.5 - align.x * 0.5) * this._canvas.textWidth / this._canvas.canvas.width;
			this.sprite.center.y = 1 - (align.y * 0.5 + 0.5) * this._canvas.textHeight / this._canvas.canvas.height;
		}
	}

	getHtmlColor(val:number)
	{
		return '#' + ( '000000' + val.toString( 16 ) ).slice( - 6 );
	}

	setPar(par:string, val:any)
	{
		this.params[par] = val;
		if (par == 'text')
			this.setText(val);
		if (par == 'font_name')
			this._font = this.params['font_size'] + ' ' + this.params['font_name'];
		if (par == 'font_size')
			this._font = this.params['font_size'] + ' ' + this.params['font_name'];
		if (par == 'font_color')
			this._fillStyle = this.getHtmlColor(val);
		if (par == 'bg_color')
			this._backgroundColor = val == 0 ? 'transparent' : this.getHtmlColor(val);
		if (par == 'align')
			this._align = val;
		if (par == 'antialias')
			this._antialias = val;
		if (par == 'shadow_color')
			this._shadowColor = this.getHtmlColor(val);

		if (par == 'shadow_blur')
			this._shadowBlur = val;

		if (par == 'shadow_x')
			this._shadowOffsetX = val;

		if (par == 'shadow_y')
			this._shadowOffsetY = val;
		this.updateText();
	}

	getPar(par:string)
	{
		return this.params[par];
	}
}


