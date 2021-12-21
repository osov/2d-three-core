import * as THREE from 'three';
import {InputManager} from './InputManager';
const {Text, preloadFont} = require('troika-three-text');
//import TextTexture from '@seregpie/three.text-texture';


export interface InitParams{
	isPerspective?:boolean
}

export class RenderManager extends InputManager{
	public readonly container:HTMLElement;
	public readonly scene:THREE.Scene;
	public readonly camera: THREE.Camera;
	public readonly renderer:THREE.WebGLRenderer;
	public readonly raycastGroup:THREE.Group;

	public readonly textures:{[key: string]: THREE.Texture} = {};
	public readonly params:InitParams;
	private font:string = '';

	constructor(params:InitParams = {isPerspective:false})
	{
		super();
		this.params = params;
		const width = window.innerWidth;
		const height =  window.innerHeight;
		const isPerspective = params.isPerspective !== undefined && params.isPerspective === true;
		if (isPerspective)
		{
			const cam = new THREE.PerspectiveCamera(75, width / height, 0.1, 100)
			cam.position.z = 2;
			this.camera = cam;
		}
		else
		{
			const near = -10;
			const far = 10;
			const cam = new THREE.OrthographicCamera(0, 0, 0, 0, near, far);
			cam.zoom = 1;
			this.camera = cam;
		}

		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(width, height);
		this.renderer.setClearColor( 0xffffff, 1 );
		this.raycastGroup = new THREE.Group();
		this.scene.add(this.raycastGroup);
		this.container = document.body;
		this.container.appendChild(this.renderer.domElement);
		this.container.oncontextmenu = function(){return false;}
		this.onResize();
	}

	async init(font:string)
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
			var textureCanvas = new THREE.CanvasTexture( imageCanvas );
			textureCanvas.wrapS = THREE.RepeatWrapping;
			textureCanvas.wrapT = THREE.RepeatWrapping;
			textureCanvas.name = "bad_texture";
			this.textures['bad'] = textureCanvas;
		}
		this.font = font;
		await this.preloadFont(font);
	}

	onResize()
	{
		const width = window.innerWidth;
		const height =  window.innerHeight;
		const isPerspective = this.params.isPerspective !== undefined && this.params.isPerspective === true;
		if (isPerspective)
		{
			(this.camera as THREE.PerspectiveCamera).aspect = width / height;
			(this.camera as THREE.PerspectiveCamera).updateProjectionMatrix();
		}
		else
		{
			const left = -width/2;
			const right = width/2;
			const top = height/2;
			const bottom = -height/2;
			(this.camera as THREE.OrthographicCamera).top = top;
			(this.camera as THREE.OrthographicCamera).right = right;
			(this.camera as THREE.OrthographicCamera).left = left;
			(this.camera as THREE.OrthographicCamera).bottom = bottom;

			(this.camera as THREE.OrthographicCamera).updateProjectionMatrix();
		}
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		//this.render();
	}

// ----------------------------------------------------------------------------------------------------------
// loaders
// ----------------------------------------------------------------------------------------------------------
	preloadFont(url:string)
	{
		return new Promise(function(resolve, reject)
		{
			preloadFont({font: url},  () => {resolve(true);});
		});
	}

	loadTexture(path:string):Promise<THREE.Texture>
	{
		return new Promise(function(resolve, reject)
		{
			var loader = new THREE.TextureLoader();
			loader.load(
				path,
				function (texture)
				{
					texture.name = path;
					resolve(texture);
				},
				function ( xhr )
				{
					//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
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
			this.textures[filename] = tex;
		}
		return this.textures;
	}

	getMap(name:string):THREE.Texture
	{
		if (!this.textures[name])
		{
			console.warn("Текстура не загружена:", name);
			return this.textures['bad'];
		}
		return this.textures[name];
	}

// ----------------------------------------------------------------------------------------------------------
// Adding
// ----------------------------------------------------------------------------------------------------------
	addMesh(mesh:THREE.Object3D, parent:THREE.Object3D|null = null, addToRaycast = false)
	{
		if (parent == null)
			this.scene.add(mesh);
		else
			parent.add(mesh);
		if (addToRaycast)
			this.raycastGroup.add(mesh);
		return mesh;
	}

	addSprite(image = '', parent:THREE.Object3D|null = null, addToRaycast = false)
	{
		var mesh = new THREE.Sprite( new THREE.SpriteMaterial( {map: this.getMap(image)}) );
		return this.addMesh(mesh, parent, addToRaycast);
	}

	addSpriteAsPlane(image = '', parent:THREE.Object3D|null = null, addToRaycast = false)
	{
		const geometry = new THREE.PlaneBufferGeometry( 1, 1 );
		const material = new THREE.MeshBasicMaterial( {color: 0xffffff, map:this.getMap(image)} );
		if (material.map)
			material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
		const mesh = new THREE.Mesh( geometry, material);
		return this.addMesh(mesh, parent, addToRaycast);
	}

	async addText(val:string, size=16, parent:THREE.Object3D|null = null, , addToRaycast = false)
	{
		var mesh = new Text()
		mesh.font = this.font;
		mesh.text =  val
		mesh.fontSize = size
		mesh.color = 0xffffff
		mesh.sync()
		mesh.anchorX = '50%';
		return this.addMesh(mesh, parent, addToRaycast);
	}

	remove(sprite:THREE.Object3D)
	{
		if (sprite.parent !== null)
		{
			sprite.parent.remove(sprite);
			return true;
		}
		return false;
	}

	removeChild(sprite:THREE.Object3D, index:number)
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

	setVisible(sprite:THREE.Object3D, val:boolean, child:number=-1)
	{
		if (child > -1)
		{
			if (child + 1 > sprite.children.length)
				return console.warn("Дочерний элемент не найден:", child);
			this.setVisible(sprite.children[child], val);
			return;
		}
		sprite.visible = val;
	}

	setColor(sprite:THREE.Sprite|THREE.Mesh, color = '', alpha = -1, isChilds = false)
	{
		if (isChilds)
		{
			for (var i = sprite.children.length - 1; i >= 0; i--)
				this.setColor((sprite.children[i] as THREE.Sprite), color);
		}
		if (alpha != -1)
		{
			if (sprite instanceof THREE.Sprite)
			{
				sprite.material.transparent = true;
				sprite.material.opacity = alpha;
			}
			else
			{
				var mat = sprite.material as THREE.MeshBasicMaterial;
				mat.transparent = true;
				mat.opacity = alpha;
			}
		}
		if (sprite instanceof THREE.Sprite)
		{
			sprite.material.color.set( color );
		}
		else
		{
			var mat = sprite.material as THREE.MeshBasicMaterial;
			mat.color.set( color );
		}

	}

	setImage(sprite:THREE.Object3D, image:string)
	{
		var spr = (sprite as THREE.Sprite);
		spr.material.map = this.getMap(image);
	}

	getAngleBetweenPoints(p1:THREE.Vector2|THREE.Vector3, p2:THREE.Vector2|THREE.Vector3):number
	{
		var delta = new THREE.Vector2(p1.x, p1.y).sub(new THREE.Vector2(p2.x, p2.y));
		var angle = Math.atan2(delta.x, delta.y);
		if (angle < 0)
			angle += 2 * Math.PI;
		return angle;
	}

	setAngle(sprite:THREE.Sprite|THREE.Mesh, angle:number)
	{
		if (sprite instanceof THREE.Mesh)
			sprite.rotation.z = angle;
	}

	setScale(sprite:THREE.Object3D, scale:number)
	{
		sprite.scale.setScalar(scale);
	}

}