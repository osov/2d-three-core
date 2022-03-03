import {PointsMaterial} from 'three';
import {Entity} from '../entitys/Entity';
import {ParticlesStack} from '../entitys/ParticlesStack';
import {ParticleItem} from '../entitys/ParticleItem';
import {BasePool} from './BasePool';
import {ObjectsPool} from './ObjectsPool';
import {ParticlesPool} from './ParticlesPool';
import {RenderSystem} from '../systems/RenderSystem';
import { BaseSystem } from 'ecs-threejs';

export class PoolsManager extends BaseSystem{

	private rs:RenderSystem;
	private pools:{[k:string]:BasePool} = {};
	private particlesList:{[k:string]:ParticlesStack} = {};


	constructor()
	{
		super();
		this.rs = RenderSystem.instance;
	}

	hasPool(name:string)
	{
		return this.pools[name] !== undefined;
	}

	registerParticlesPool(name:string, material:PointsMaterial, maxCount:number)
	{
		if (this.hasPool(name))
			this.warn("Пул частиц с именем уже существует:", name);
		var stack = new ParticlesStack(material, maxCount);
		this.particlesList[name] = stack;
		this.rs.scene.add(stack);
		var pool = new ParticlesPool(new ParticleItem(stack), stack);
		this.pools[name] = pool;
		return pool;
	}

	registerObjectsPool(name:string, entity:Entity)
	{
		if (this.hasPool(name))
		this.warn("Пул объектов с именем уже существует:", name);
		var pool = new ObjectsPool(entity);
		this.pools[name] = pool;
		return pool;
	}

	getPoolItem(name:string)
	{
		var item = this.pools[name].get();
		item.prefabName = name;
		return item;
	}

	putPoolItem(entity:Entity)
	{
		if (!this.hasPool(entity.prefabName))
			return this.warn("Пул для объекта не найден:", entity.prefabName);
		this.pools[entity.prefabName].put(entity);
	}

	update(deltaTime:number)
	{
		for (var k in this.particlesList)
		{
			this.particlesList[k].update(deltaTime);
		}
	}

	clear()
	{
		for (var k in this.particlesList)
		{
			var ps = this.particlesList[k];
			ps.destroy();
			ps.removeFromParent();
		}
		this.particlesList = {};
		this.pools = {};
	}



}