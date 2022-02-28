import { BaseEntity, BaseSystem } from "ecs-threejs";
import { Entity } from "../entitys/Entity";
import { RenderSystem } from "../systems/RenderSystem";
import { PointsMaterial } from "three";
import { PoolsManager } from "./PoolsManager";


export class MasterPool extends BaseSystem {
    public static instance:MasterPool;
    private manager: PoolsManager;

    constructor(system:RenderSystem) {
        super();
        this.manager = new PoolsManager(system);
        MasterPool.instance = this;
    }

    public registerParticlesPool(name:string, material:PointsMaterial, maxCount:number)
	{
        return this.manager.registerParticlesPool(name, material, maxCount);
    }

    public registerObjectsPool(name:string, entity:Entity)
	{
        return this.manager.registerObjectsPool(name, entity);
    }

    public GetObject(name: string): Entity {
        return this.manager.getPoolItem(name);
    }

    public GetObjectAtTime(name: string, timeMs = 5000): Entity {
        // todo
        return this.GetObject(name);
    }

    public ReturnObject(name: string, go: Entity) {
        this.manager.putPoolItem(go);
    }

    public GetEntity(name:string)
    {
        return this.manager.getPoolItem(name) as Entity;
    }

    public ReturnEntity(be:Entity)
    {
        this.manager.putPoolItem(be);
    }

    public GetParticlesPool(name: string): Entity {
        // todo
        return this.GetObject(name);
    }

    public Update(deltaTime:number)
    {
        this.manager.update(deltaTime);
    }


}
