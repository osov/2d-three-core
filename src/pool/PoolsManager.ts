import { Vector2, Vector3, EventDispatcher, PointsMaterial} from 'three';
import {Entity} from '../entitys/Entity';
import {ParticlesStack} from '../entitys/ParticlesStack';
import {ParticleItem} from '../entitys/ParticleItem';
import {BasePool} from './BasePool';
import {ObjectsPool} from './ObjectsPool';
import {ParticlesPool} from './ParticlesPool';
import {RenderSystem} from '../systems/RenderSystem';

export class PoolsManager extends EventDispatcher{

	private rs:RenderSystem;
	private pools:{[k:string]:BasePool} = {};
	private particlesList:{[k:string]:ParticlesStack} = {};


	constructor(system:RenderSystem)
	{
		super();
		this.rs = system;
	}

	hasPool(name:string)
	{
		return this.pools[name] !== undefined;
	}

	registerParticlesPool(name:string, material:PointsMaterial, maxCount:number)
	{
		if (this.hasPool(name))
			console.warn("Пул частиц с именем уже существует:", name);
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
			console.warn("Пул объектов с именем уже существует:", name);
		var pool = new ObjectsPool(entity);
		this.pools[name] = pool;
		return pool;
	}

	getPoolItem(name:string)
	{
		return this.pools[name].get();
	}

	putPoolItem(entity:Entity)
	{
		if (!this.hasPool(entity.prefabName))
			return console.warn("Пул для объекта не найден:", entity.prefabName);
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
			if (ps.parent !== null)
				ps.parent.remove(ps);
		}
		this.particlesList = {};

		for (var k in this.pools)
		{
			this.pools[k].clear();
		}
		this.pools = {};
	}



}