import { Entity } from "../entitys/Entity";
import { BaseHelper } from "./BaseHelper";

export class SceneHelper extends BaseHelper {
   public static instance:SceneHelper;

    init() {
        SceneHelper.instance = this;
    }

   public static addToScene(entity:Entity)
    {
        SceneHelper.instance.gs.addEntity(entity, entity.getPosition());
    }

}