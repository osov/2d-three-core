import { BaseEntity, BaseSystem } from "ecs-threejs";
import { Entity } from "../entitys/Entity";
import { PointsMaterial } from "three";
import { PoolsManager } from "./PoolsManager";


export class MasterPool extends BaseSystem {
    public static instance:MasterPool;
    private manager: PoolsManager;
    public static isCloneMaterial = false;

    constructor() {
        super();
        MasterPool.instance = this;
        this.manager = new PoolsManager();
    }

    public static setMaterialClone(val:boolean)
    {
        this.isCloneMaterial = val;
    }

    public static registerParticlesPool(name:string, material:PointsMaterial, maxCount:number)
	{
        return MasterPool.instance.manager.registerParticlesPool(name, material, maxCount);
    }

    public static registerObjectsPool(name:string, entity:Entity)
	{
        entity.prefabName = name;
        return MasterPool.instance.manager.registerObjectsPool(name, entity);
    }

    public static GetObject(name: string): Entity {
        return MasterPool.instance.manager.getPoolItem(name);
    }

    public static GetObjectAtTime(name: string, timeMs = 5000): Entity {
        // todo
        return this.GetObject(name);
    }

    public static ReturnObject(name: string, go: Entity) {
        MasterPool.instance.manager.putPoolItem(go);
    }

    public static GetEntity(name:string)
    {
        return MasterPool.instance.manager.getPoolItem(name) as Entity;
    }

    public static ReturnEntity(be:Entity)
    {
        MasterPool.instance.manager.putPoolItem(be);
    }

    public static GetParticlesPool(name: string): Entity {
        // todo
        return this.GetObject(name);
    }

    public static Update(deltaTime:number)
    {
        MasterPool.instance.manager.update(deltaTime);
    }


}
