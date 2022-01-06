import { Vector2, Vector3, Object3D, PointsMaterial, BufferGeometry,Float32BufferAttribute, Points} from 'three';
import {deepPosition} from '../core/gameUtils';
import {Entity} from './Entity';

export class ParticlesStack extends Entity{

	public geometry:BufferGeometry;
	public material:PointsMaterial;
	protected isPoints = true;
	private freeIds:number[] = [];
	private isChanged = true;

	constructor(material:PointsMaterial, maxCount:number)
	{
		super();
		material.onBeforeCompile = shader =>
		{
			shader.vertexShader = `
			attribute float rotation;
			varying float vRotation;
			${shader.vertexShader}
			`.replace(
				`#include <fog_vertex>`,
				`#include <fog_vertex>
				vRotation = rotation;
				`
				);
			shader.fragmentShader = `
			varying float vRotation;
			${shader.fragmentShader}
			`.replace(
				`#include <map_particle_fragment>`,
				`
				#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
				vec2 uv = vec2( gl_PointCoord.x, gl_PointCoord.y );
				#endif
				#ifdef USE_MAP
				// MODIFICATION =======================================================
				float mid = 0.5;
				vec2 rotated = vec2(
				cos(vRotation) * (uv.x - mid) - sin(vRotation) * (uv.y - mid) + mid,
				-sin(vRotation) * (uv.x - mid) - cos(vRotation) * (uv.y - mid) + mid
				);
				//uv = vec2(
				//	cos(vRotation) * (uv.x - mid) + sin(vRotation) * (uv.y - mid) + mid,
				//	cos(vRotation) * (uv.y - mid) - sin(vRotation) * (uv.x - mid) + mid
				//);
				rotated *= vec2(uvTransform[0][0],uvTransform[1][1]);
				rotated += vec2(uvTransform[2][0],uvTransform[2][1]); // todo 2,0 возможно не тот
				// ====================================================================
				vec4 mapTexel = texture2D( map, rotated );
				diffuseColor *= mapTexelToLinear( mapTexel );
				#endif
				#ifdef USE_ALPHAMAP
				diffuseColor.a *= texture2D( alphaMap, uv ).g;
				#endif
				`
				);
		};

		const vertices = [];
		const rotations = [];
		for ( let i = 0; i < maxCount; i ++ ) {

			vertices.push(deepPosition.x, deepPosition.y, deepPosition.z);
			rotations.push(0);
			this.freeIds.push(i);
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute( vertices, 3 ) );
		geometry.setAttribute("rotation", new Float32BufferAttribute(rotations, 1));
		this.geometry = geometry;
		this.material = material;
		Points.prototype.updateMorphTargets.apply(this);
	}


	setIndexPosition(index:number, pos:Vector2|Vector3, apply = false)
	{
		var z = pos instanceof Vector3 ? pos.z : this.geometry.attributes.position.getZ(index);
		var vec = new Vector3(pos.x,pos.y,z).sub(this.position);
		this.geometry.attributes.position.setXYZ(index, vec.x, vec.y, vec.z);
		if (apply)
			this.geometry.attributes.position.needsUpdate = true;
		else
			this.isChanged = true;
	}

	setIndexRotation(index:number, angleRad:number, apply = false)
	{
		this.geometry.attributes.rotation.setX(index, angleRad);
		if (apply)
			this.geometry.attributes.rotation.needsUpdate = true;
		else
			this.isChanged = true;
	}

	getIndexPosition(index:number)
	{
		var arr = this.geometry.attributes.position.array;
		return new Vector3(arr[index*3], arr[index*3+1], arr[index*3+2]);
	}

	getIndexRotation(index:number)
	{
		return this.geometry.attributes.rotation.getX(index);
	}

	getFreeIndex()
	{
		if (this.freeIds.length == 0)
			return -1;
		var id = this.freeIds.splice(0, 1)[0];
		return id;
	}

	freeIndex(index:number)
	{
		var ind = this.freeIds.indexOf(index);
		if (ind > -1)
			return console.warn("Индекс уже освобожден:", index);
		this.freeIds.push(index);
	}

	update(deltaTime:number)
	{
		if (!this.isChanged)
			return;
		this.isChanged = false;
		this.geometry.attributes.position.needsUpdate = true;
		this.geometry.attributes.rotation.needsUpdate = true;
	}

}