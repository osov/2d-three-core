import { MeshBasicMaterial,	TextureLoader, Texture, CanvasTexture, RepeatWrapping} from 'three';
import {BaseSystem} from './BaseSystem';
const {preloadFont} = require('troika-three-text');


export class ResourceSystem extends BaseSystem{

	public fontUrl:string = '';
	private readonly textures:{[key: string]: Texture} = {};
	private badMaterial:MeshBasicMaterial;

	constructor()
	{
		super();
	}

	async init(fontUrl:string)
	{
		var imageCanvas = document.createElement("canvas");
		var context = imageCanvas.getContext("2d");
		if (context != null)
		{
			imageCanvas.width = imageCanvas.height = 128;
			context.fillStyle = "#444";
			context.fillRect( 0, 0, 128, 128 );
			context.fillStyle = "#fff";
			context.fillRect( 0, 0, 64, 64);
			context.fillRect( 64, 64, 64, 64 );
			var textureCanvas = new CanvasTexture( imageCanvas );
			textureCanvas.wrapS = RepeatWrapping;
			textureCanvas.wrapT = RepeatWrapping;
			textureCanvas.name = "bad_texture";
			this.textures['bad'] = textureCanvas;
			this.badMaterial = new MeshBasicMaterial({map:this.textures['bad']});
		}
		this.fontUrl = fontUrl;
		if (this.fontUrl != '')
			await this.preloadFont(fontUrl);
	}

	private preloadFont(url:string)
	{
		return new Promise(function(resolve, reject)
		{
			preloadFont({font: url}, () => {resolve(true);});
		});
	}

	private loadTexture(path:string):Promise<Texture>
	{
		return new Promise(function(resolve, reject)
		{
			var loader = new TextureLoader();
			loader.load(
				path,
				function (texture)
				{
					texture.name = path;
					resolve(texture);
				},
				function ( xhr )
				{
					//this.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
				},
				function ( xhr )
				{
					reject( new Error ( xhr + 'An error occurred loading while loading' + xhr ) )
				});
			});
	}

	async loadTextures(path:string, names:string[])
	{
		var promises = [];
		for (var i = 0; i < names.length; i++)
			promises.push(this.loadTexture(path + names[i]));
		var list = await Promise.all( promises );

		for (var i = list.length - 1; i >= 0; i--)
		{
			var tex = list[i];
			var filename = tex.name.replace(/^.*[\\\/]/, '');
			filename = filename.substr(0, filename.length - 4);
			tex.name = filename;
			this.textures[filename] = tex;
		}
		return this.textures;
	}

	getTexture(name:string):Texture
	{
		if (!this.textures[name])
		{
			console.warn("Текстура не загружена:", name);
			return this.textures['bad'];
		}
		return this.textures[name];
	}

	getMaterial(name:string):MeshBasicMaterial
	{
		return this.badMaterial;
	}

}