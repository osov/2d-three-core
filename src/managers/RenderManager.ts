import {
	Scene, Camera, WebGLRenderer, Group,
	PerspectiveCamera, OrthographicCamera,
	Sprite,SpriteMaterial,PlaneBufferGeometry,MeshBasicMaterial,Mesh,Object3D,
	TextureLoader, Texture, CanvasTexture, RepeatWrapping,
	Vector2, Vector3} from 'three';

import * as THREE from 'three';

import {InputManager} from './InputManager';
import {EntityType} from '../entitys/Entity';
import * as gUtils from '../core/gameUtils';
const {Text, preloadFont} = require('troika-three-text');

export interface InitParams{
	isPerspective?:boolean
}

interface PrefabInfo{
	type:EntityType;
	mapName:string;
	item:Object3D;
}

export class RenderManager extends InputManager{
	public readonly container:HTMLElement;
	public readonly scene:Scene;
	public readonly camera:Camera;
	public readonly renderer:WebGLRenderer;
	public readonly raycastGroup:Group;

	private readonly textures:{[key: string]: Texture} = {};
	private readonly params:InitParams;
	private readonly prefabs:{[key: string]: PrefabInfo} = {};
	private fontUrl:string = '';

	constructor(params:InitParams = {isPerspective:false})
	{
		super();
		this.params = params;
		const width = window.innerWidth;
		const height =  window.innerHeight;
		const isPerspective = params.isPerspective !== undefined && params.isPerspective === true;
		if (isPerspective)
		{
			const cam = new PerspectiveCamera(75, width / height, 0.1, 100)
			cam.position.z = 2;
			this.camera = cam;
		}
		else
		{
			const cam = new OrthographicCamera(0, 0, 0, 0, -10, 10);
			cam.zoom = 1;
			this.camera = cam;
		}

		this.scene = new Scene();
		this.renderer = new WebGLRenderer();
		this.renderer.setSize(width, height);
		this.renderer.setClearColor( 0xffffff, 1 );
		this.raycastGroup = new Group();
		this.scene.add(this.raycastGroup);

		this.container = document.body;
		this.container.appendChild(this.renderer.domElement);
		this.container.oncontextmenu = function(){return false;}
		this.onResize();
	}

	async initRender(fontUrl:string)
	{
		var imageCanvas = document.createElement( "canvas" );
		var context = imageCanvas.getContext( "2d" );
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
		}
		this.fontUrl = fontUrl;
		await this.preloadFont(fontUrl);
	}

	protected onResize()
	{
		const width = this.container.clientWidth;
		const height =  this.container.clientHeight;
		const isPerspective = this.params.isPerspective !== undefined && this.params.isPerspective === true;
		if (isPerspective)
		{
			(this.camera as PerspectiveCamera).aspect = width / height;
			(this.camera as PerspectiveCamera).updateProjectionMatrix();
		}
		else
		{
			const left = -width/2;
			const right = width/2;
			const top = height/2;
			const bottom = -height/2;
			(this.camera as OrthographicCamera).top = top;
			(this.camera as OrthographicCamera).right = right;
			(this.camera as OrthographicCamera).left = left;
			(this.camera as OrthographicCamera).bottom = bottom;

			(this.camera as OrthographicCamera).updateProjectionMatrix();
		}
		this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
		//this.render();
	}

// ----------------------------------------------------------------------------------------------------------
// loaders
// ----------------------------------------------------------------------------------------------------------

	preloadFont(url:string)
	{
		return new Promise(function(resolve, reject)
		{
			preloadFont({font: url}, () => {resolve(true);});
		});
	}

	loadTexture(path:string):Promise<Texture>
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

	getMap(name:string):Texture
	{
		if (!this.textures[name])
		{
			this.warn("Текстура не загружена:", name);
			return this.textures['bad'];
		}
		return this.textures[name];
	}

// ----------------------------------------------------------------------------------------------------------
// Adding
// ----------------------------------------------------------------------------------------------------------
	registerPrefab(name:string, prefab:Object3D)
	{
		if (this.prefabs[name])
		{
			this.warn("Префаб уже зарегистрирован:", name);
			return false;
		}
		prefab.visible = false;
		var mapName = '';
		var type = EntityType.mesh;
		if (prefab instanceof Sprite)
		{
			type = EntityType.sprite;
			if (prefab.material.map)
				mapName = prefab.material.map.name;
		}
		else if (prefab instanceof Text)
			type = EntityType.text;
		else
		{
			type = EntityType.mesh;
			if (prefab instanceof Mesh && prefab.material)
				mapName = prefab.material.map.name;
		}
		//if (prefab instanceof )
		this.prefabs[name] = {type:type, item:prefab, mapName:mapName};

	}

	CreatePrefab(name:string, pos:Vector3, angle:number = 0)
	{
		if (!this.prefabs[name])
		{
			this.warn("Префаб не зарегистрирован:", name);
			return false;
		}
		var prefabInfo = this.prefabs[name];
		var prefab = prefabInfo.item;
		var mesh = null;
		if (prefabInfo.type == EntityType.sprite)
			mesh = this.addSprite(prefabInfo.mapName);
		if (prefabInfo.type == EntityType.text)
			mesh = this.addText('text - '+name);
		else
			mesh = this.addSpriteAsPlane(prefabInfo.mapName);
		var z = (pos instanceof Vector3) ? pos.z : 0;
		mesh.position.set(pos.x, pos.y, z );
		return mesh;
	}

	protected addMesh(mesh:Object3D, parent:Object3D|null = null, addToRaycast = false)
	{
		if (parent == null)
			this.scene.add(mesh);
		else
			parent.add(mesh);
		if (addToRaycast)
			this.raycastGroup.add(mesh);
		return mesh;
	}

	addSprite(image:string, parent:Object3D|null = null, addToRaycast = false)
	{
		var mesh = new Sprite( new SpriteMaterial( {map: this.getMap(image)}) );
		return this.addMesh(mesh, parent, addToRaycast);
	}

	addSpriteAsPlane(image:string, parent:Object3D|null = null, addToRaycast = false)
	{
		const geometry = new PlaneBufferGeometry( 1, 1 );
		const material = new MeshBasicMaterial( {color: 0xffffff, map:this.getMap(image)} );
		if (material.map)
			material.map.wrapS = material.map.wrapT = RepeatWrapping;
		const mesh = new Mesh( geometry, material);
		return this.addMesh(mesh, parent, addToRaycast) as Mesh;
	}

	addSpriteAsParticle(master:string)
	{
	}

	addText(val:string, size=16, parent:Object3D|null = null, addToRaycast = false)
	{
		var mesh = new Text()
		mesh.font = this.fontUrl;
		mesh.text =  val
		mesh.fontSize = size
		mesh.color = 0xf0fff0
		mesh.sync()
		mesh.anchorX = '50%';
		return this.addMesh(mesh, parent, addToRaycast);
	}

	remove(sprite:Object3D)
	{
		if (sprite.parent !== null)
		{
			var index = this.raycastGroup.children.indexOf(sprite);
			if (index > -1)
				this.raycastGroup.remove(sprite);
			sprite.parent.remove(sprite);
			return true;
		}
		return false;
	}

	removeChild(sprite:Object3D, index:number)
	{
		if (index + 1 > sprite.children.length)
		{
			this.warn("Дочерний элемент не найден:", index);
			return false;
		}
		return this.remove(sprite.children[index]);
	}

// ----------------------------------------------------------------------------------------------------------
// propertys
// ----------------------------------------------------------------------------------------------------------

	setBgColor(color:number)
	{
		this.renderer.setClearColor( color, 1 );
	}

	setVisible(sprite:Object3D, val:boolean, child:number=-1)
	{
		if (child > -1)
		{
			if (child + 1 > sprite.children.length)
				return this.warn("Дочерний элемент не найден:", child);
			this.setVisible(sprite.children[child], val);
			return;
		}
		sprite.visible = val;
	}

	setColor(sprite:Object3D, color = '', alpha = -1, isChilds = false)
	{
		if (isChilds)
		{
			for (var i = sprite.children.length - 1; i >= 0; i--)
				this.setColor(sprite.children[i], color);
		}
		if (alpha != -1)
		{
			if (sprite instanceof Sprite)
			{
				sprite.material.transparent = true;
				sprite.material.opacity = alpha;
			}
			else if (sprite instanceof Mesh)
			{
				var mat = sprite.material as MeshBasicMaterial;
				mat.transparent = true;
				mat.opacity = alpha;
			}
		}
		if (sprite instanceof Sprite)
		{
			sprite.material.color.set( color );
		}
		else if (sprite instanceof Mesh)
		{
			var mat = sprite.material as MeshBasicMaterial;
			mat.color.set( color );
		}
		else
			this.warn("Тип меша не найден:", sprite);

	}

	setImage(sprite:Object3D, image:string)
	{
		if (sprite instanceof Sprite)
		{
			sprite.material.map = this.getMap(image);
		}
		else
			this.warn("Тип меша не найден:", sprite);
	}

	getAngleBetweenPoints(p1:Vector2|Vector3, p2:Vector2|Vector3):number
	{
		return gUtils.getAngleBetweenPoints(p1,p2);
	}

	setAngle(sprite:Sprite|Mesh, angle:number)
	{
		if (sprite instanceof Mesh)
			sprite.rotation.z = angle;
	}

	setScale(sprite:Object3D, scale:number)
	{
		sprite.scale.setScalar(scale);
	}

}