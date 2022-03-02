import { GameSystem } from "../systems/GameSystem";
import { Entity } from "../entitys/Entity";
import { BaseHelper } from "./BaseHelper";

export class SceneHelper extends BaseHelper {
   public static instance:SceneHelper;

    init() {
        SceneHelper.instance = this;
    }

   public static addToScene(entity:Entity, nameParent:string = '')
   {
        var parent = null;
        if (nameParent != '')
        {
            var scene = GameSystem.instance.scene;
            for (let i = 0; i < scene.children.length; i++) {
                const it = scene.children[i];
                if (it.userData['name'] == nameParent)
                {
                    parent = it;
                    break;
                }
                
            }
        }
        
        SceneHelper.instance.gs.addEntity(entity, entity.getPosition(), 0, false, parent);
    }

}