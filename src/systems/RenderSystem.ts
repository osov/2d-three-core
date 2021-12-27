import {
	Scene, Camera, WebGLRenderer, Group,
	PerspectiveCamera, OrthographicCamera,
	Sprite,SpriteMaterial,PlaneBufferGeometry,MeshBasicMaterial,Mesh,Object3D,
	TextureLoader, Texture, CanvasTexture, RepeatWrapping,
	Vector2, Vector3} from 'three';

import {EventSystem} from './EventSystem';
import {ResourceSystem} from './ResourceSystem';
import {EntitysSystem} from './EntitysSystem';
import {Entity} from '../entitys/Entity';


export interface InitParams{
	isPerspective?:boolean
}

export class RenderSystem extends EventSystem{
	public readonly container:HTMLElement;
	public readonly scene:Scene;
	public readonly camera:Camera;
	public readonly renderer:WebGLRenderer;
	public readonly resourceSystem:ResourceSystem;
	public readonly entitysSystem:EntitysSystem;
	private readonly params:InitParams;

	constructor(params:InitParams = {isPerspective:false})
	{
		super();
		this.params = params;
		const width = window.innerWidth;
		const height =  window.innerHeight;
		if (params.isPerspective)
		{
			const cam = new PerspectiveCamera(75, width / height, 0.1, 100)
			cam.position.z = 1;
			this.camera = cam;
		}
		else
		{
			const cam = new OrthographicCamera(0, 0, 0, 0, -10, 10);
			cam.position.z = 1;
			cam.zoom = 1;
			this.camera = cam;
		}

		this.scene = new Scene();
		this.renderer = new WebGLRenderer();
		this.renderer.setSize(width, height);
		this.renderer.setClearColor( 0xffffff, 1 );

		this.container = document.body;
		this.container.appendChild(this.renderer.domElement);
		this.container.oncontextmenu = function(){return false;}
		this.onResize();

		this.resourceSystem = new ResourceSystem();
		this.entitysSystem = new EntitysSystem(this);
	}

	protected async initRender(fontUrl:string)
	{
		await this.resourceSystem.init(fontUrl);
	}


	protected onResize()
	{
		const width = this.container.clientWidth;
		const height =  this.container.clientHeight;
		if (this.params.isPerspective)
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
	// Methods
	// ----------------------------------------------------------------------------------------------------------

	async loadTextures(path:string, names:string[])
	{
		return this.resourceSystem.loadTextures(path, names);
	}

	addEntity(entity:Entity, pos:Vector3 = new Vector3(), angle:number = 0, parent:Object3D|null = null, id:number = -1)
	{
		return this.entitysSystem.addEntity(entity, pos, angle, parent, id);
	}

	addEntityByName(name:string, pos:Vector3 = new Vector3(), angle:number = 0, parent:Object3D|null = null, id:number = -1)
	{
		return this.entitysSystem.addEntityByName(name, pos, angle, parent, id);
	}

	remove(entity:Entity, isDestroy = false)
	{
		return this.entitysSystem.remove(entity, isDestroy);
	}

	clearScene(fullClear = true)
	{
		return this.entitysSystem.clearScene(fullClear);
	}

	setBgColor(color:number)
	{
		this.renderer.setClearColor( color, 1 );
	}


}