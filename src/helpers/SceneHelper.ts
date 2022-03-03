import { GameSystem } from "../systems/GameSystem";
import { Entity } from "../entitys/Entity";
import { BaseHelper } from "./BaseHelper";
import { BaseEntity } from "ecs-threejs";
import { Object3D } from "three";
import { GameObject } from "ecs-threejs/src/unityTypes/unityInterfaces";



export class SceneHelper extends BaseHelper {
    public static instance: SceneHelper;

    constructor() {
        super();
        SceneHelper.instance = this;
    }

    public static addToScene(entity: Entity, nameParent: string = '') {
        var parent = null;
        if (nameParent != '') {
            if (nameParent == 'sceneOrtho')
                parent = GameSystem.instance.sceneOrtho;
            else {
                var scene = GameSystem.instance.scene;
                for (let i = 0; i < scene.children.length; i++) {
                    const it = scene.children[i];
                    if (it.name == nameParent) {
                        parent = it;
                        break;
                    }

                }
            }
        }

        GameSystem.instance.addEntity(entity, entity.getPosition(), 0, false, parent);
    }

    public static addToUIScene(entity: Entity) {
        SceneHelper.addToScene(entity, 'sceneOrtho');

        GameSystem.instance.doResize();
    }

    public static getGameObjectByName(name: string) {
        for (let s = 0; s < 2; s++) {
            var scene = s == 0 ? GameSystem.instance.scene : GameSystem.instance.sceneOrtho;
            for (let i = 0; i < scene.children.length; i++) {
                const it = scene.children[i];
                if (it.name == name) {
                    return it;
                }
            }
        }
        return null;
    }

    public static getEntityByName(name: string) {
        var e = this.getGameObjectByName(name);
        if (!(e instanceof BaseEntity))
            console.warn("Объект не является сущностью:", name);
        return e as BaseEntity;
    }

    public static getAllChildren(go: Object3D, list: BaseEntity[]) {
        for (let i = 0; i < go.children.length; i++) {
            const ch = go.children[i];
            if (ch instanceof BaseEntity)
                list.push(ch);
            if (ch.children.length > 0)
                this.getAllChildren(ch, list);
        }
    }

    public static getAll() {
        var list: GameObject[] = [];
        for (let s = 0; s < 2; s++) {
            var scene = s == 0 ? GameSystem.instance.scene : GameSystem.instance.sceneOrtho;
            for (let i = 0; i < scene.children.length; i++) {
                var ch = scene.children[i];
                if (ch instanceof BaseEntity)
                    list.push(ch);
                this.getAllChildren(ch, list);
            }
        }
        return list;
    }



}