import { Scene, Camera, WebGLRenderer, PerspectiveCamera, OrthographicCamera, Object3D, Vector2, Vector3 } from 'three';
import { ResourceSystem } from './ResourceSystem';
import { EntitysSystem } from './EntitysSystem';
import { Entity } from '../entitys/Entity';
import { BaseSystem, EventBus, Input } from 'ecs-threejs';
import { UiSprite } from '../entitys/UiSprite';


export interface InitParams {
	isPerspective?: boolean;
	worldWrap: boolean;
	worldSize: Vector2;
	viewDistance: number;
	container?: HTMLElement | null;
}

export class RenderSystem extends BaseSystem {
	public readonly scene: Scene;
	public readonly sceneOrtho: Scene;
	public readonly camera: Camera;
	public readonly cameraOrtho: OrthographicCamera;
	public readonly renderer: WebGLRenderer;
	public readonly resourceSystem: ResourceSystem;
	public readonly entitysSystem: EntitysSystem;
	public readonly params: InitParams;
	public readonly container: HTMLElement;

	constructor(params: InitParams = { isPerspective: false, worldWrap: false, worldSize: new Vector2(1, 1), viewDistance: 1 }) {
		super();
		this.container = params.container ? params.container : document.body;
		this.params = params;
		const width = window.innerWidth;
		const height = window.innerHeight;
		if (params.isPerspective) {
			const cam = new PerspectiveCamera(75, width / height, 0.1, 100)
			cam.position.z = 1;
			this.camera = cam;
		}
		else {
			const cam = new OrthographicCamera(0, 0, 0, 0, -10, 10);
			cam.position.z = 1;
			cam.zoom = 1;
			this.camera = cam;
		}
		this.cameraOrtho = new OrthographicCamera(0, 0, 0, 0, 0, 1);
		this.cameraOrtho.position.z = 1;
		this.cameraOrtho.zoom = 1;

		this.scene = new Scene();
		this.sceneOrtho = new Scene();
		this.renderer = new WebGLRenderer();
		this.renderer.setSize(width, height);
		this.renderer.setClearColor(0xffffff, 1);
		this.renderer.autoClear = false;

		this.container.appendChild(this.renderer.domElement);
		this.container.oncontextmenu = function () { return false; }
		this.onResize();

		this.resourceSystem = new ResourceSystem();
		this.entitysSystem = new EntitysSystem(this);
		Input.getInstance().init(this.container);
		EventBus.subscribeEvent('onResize', this.onResize.bind(this));
	}

	protected async initRender(fontUrl: string) {
		await this.resourceSystem.init(fontUrl);
	}

	//@addSubscribeEvent('onResize')
	protected onResize() {
		//console.log(this)
		const width = this.container.clientWidth;
		const height = this.container.clientHeight;
		if (this.params.isPerspective) {
			(this.camera as PerspectiveCamera).aspect = width / height;
			(this.camera as PerspectiveCamera).updateProjectionMatrix();
		}
		else {
			const left = -width / 2;
			const right = width / 2;
			const top = height / 2;
			const bottom = -height / 2;
			(this.camera as OrthographicCamera).top = top;
			(this.camera as OrthographicCamera).right = right;
			(this.camera as OrthographicCamera).left = left;
			(this.camera as OrthographicCamera).bottom = bottom;

			(this.camera as OrthographicCamera).updateProjectionMatrix();
		}

		this.cameraOrtho.left = - width / 2;
		this.cameraOrtho.right = width / 2;
		this.cameraOrtho.top = height / 2;
		this.cameraOrtho.bottom = - height / 2;
		this.cameraOrtho.updateProjectionMatrix();

		this.updateHud(width, height);

		this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
	}

	protected updateHud(width: number, height: number) {
		for (let i = 0; i < this.sceneOrtho.children.length; i++) {
			const m = this.sceneOrtho.children[i];
			if (m instanceof UiSprite) {
				let align = m.align;
				let tx = 0;
				let ty = 0;
				if (align.x == -1)
					tx = - width * 0.5;
				if (align.x == 1)
					tx = width * 0.5;
				if (align.y == -1)
					ty = - height * 0.5;
				if (align.y == 1)
					ty = height * 0.5;
				m.setPositionXY(tx + m.srcPos.x, ty + m.srcPos.y);
			}

		}
	}

	public addUi(mesh:Object3D){
		this.sceneOrtho.add(mesh);
		this.onResize();
	}


	// ----------------------------------------------------------------------------------------------------------
	// Methods
	// ----------------------------------------------------------------------------------------------------------

	async loadTextures(path: string, names: string[]) {
		return this.resourceSystem.loadTextures(path, names);
	}

	addEntity(entity: Entity, pos: Vector3 = new Vector3(), angleDeg: number = 0, isDynamic: boolean = false, parent: Object3D | null = null, id: number = -1) {
		return this.entitysSystem.addEntity(entity, pos, angleDeg, isDynamic, parent, id);
	}

	addEntityByName(name: string, pos: Vector3 = new Vector3(), angleDeg: number = 0, isDynamic: boolean = false, parent: Object3D | null = null, id: number = -1) {
		return this.entitysSystem.addEntityByName(name, pos, angleDeg, isDynamic, parent, id);
	}

	addToNotWrapList(entity: Entity) {
		this.entitysSystem.notWrappedIds.add(entity.idEntity);
	}

	removeEntity(entity: Entity, isDestroy = false) {
		return this.entitysSystem.remove(entity, isDestroy);
	}

	removeById(id: number, isDestroy = false) {
		return this.entitysSystem.removeById(id, isDestroy);
	}

	clearScene(fullClear = true) {
		return this.entitysSystem.clearScene(fullClear);
	}

	setBgColor(color: number) {
		this.renderer.setClearColor(color, 1);
	}

	doFull() {
		this.container.requestFullscreen();
	}


}