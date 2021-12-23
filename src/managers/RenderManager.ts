import {
	Scene, Camera, WebGLRenderer, Group,
	PerspectiveCamera, OrthographicCamera,
	Sprite,SpriteMaterial,PlaneBufferGeometry,MeshBasicMaterial,Mesh,Object3D,
	TextureLoader, Texture, CanvasTexture, RepeatWrapping,
	Vector2, Vector3} from 'three';

import {EventManager} from './EventManager';
import {ResourceManager} from './ResourceManager';
import {EntitysManager} from './EntitysManager';
import {Entity} from '../entitys/Entity';


export interface InitParams{
	isPerspective?:boolean
}

export class RenderManager extends EventManager{
	public readonly container:HTMLElement;
	public readonly scene:Scene;
	public readonly camera:Camera;
	public readonly renderer:WebGLRenderer;
	public readonly raycastGroup:Group;
	public readonly resourceManager:ResourceManager;
	public readonly entitysManager:EntitysManager;
	private readonly params:InitParams;

	constructor(params:InitParams = {isPerspective:false})
	{
		super();
		this.params = params;
		const width = window.innerWidth;
		const height =  window.innerHeight;
		const isPerspective = params.isPerspective === true;
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

		this.resourceManager = new ResourceManager();
		this.entitysManager = new EntitysManager(this);
	}

	protected async initRender(fontUrl:string)
	{
		await this.resourceManager.init(fontUrl);
	}


	protected onResize()
	{
		const width = this.container.clientWidth;
		const height =  this.container.clientHeight;
		const isPerspective = this.params.isPerspective === true;
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
// Adding
// ----------------------------------------------------------------------------------------------------------

	async loadTextures(path:string, names:string[])
	{
		return this.resourceManager.loadTextures(path, names);
	}

	registerPrefab(name:string, prefab:Entity)
	{
		return this.entitysManager.registerPrefab(name, prefab);
	}

	addEntity(name:string, pos:Vector3, angle:number = 0, parent:Object3D|null = null, addToRaycast = false, id:number = -1)
	{
		return this.entitysManager.addEntity(name, pos, angle, parent, addToRaycast, id);
	}

	remove(entity:Entity)
	{
		return this.entitysManager.remove(entity);
	}


// ----------------------------------------------------------------------------------------------------------
// propertys
// ----------------------------------------------------------------------------------------------------------

	setBgColor(color:number)
	{
		this.renderer.setClearColor( color, 1 );
	}

}