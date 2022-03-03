import { ButtonCallback } from "../entitys/UiButton";
import { UiButton } from "../entitys/UiButton";
import { SceneHelper } from "./SceneHelper";

export class GameUtils{
    constructor(){

    }

    public static AddButtonCallback(btnName:string, callback:ButtonCallback){
        var btn = SceneHelper.getGameObjectByName(btnName);
        if (!btn){
            return console.warn("Кнопка не найдена:",btnName);
        }
        var ui = (btn as UiButton);
        ui.addCallback(callback);
    }
}