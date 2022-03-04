import { float } from "ecs-threejs/src/core/ConvertTypes";
import { ButtonCallback } from "../entitys/UiButton";
import { UiButton } from "../entitys/UiButton";
import { SceneHelper } from "./SceneHelper";
import * as TWEEN from '@tweenjs/tween.js';

export type TweenCallback = (value?: number) => void;

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

    public static DoShare(text:string, id:string){
        console.log("Поделились:", text, id);
    }

    public static tweenCallback(time: float, delay: float, onStart: TweenCallback, onUpdate?: TweenCallback, onComplete?: TweenCallback, inverse: boolean = false) {
		let val = { value: inverse ? 1 : 0 };
		const tween = new TWEEN.Tween(val)
			.delay(delay)
			.to({ value: inverse ? 0 : 1 }, time)
			.easing(TWEEN.Easing.Linear.None)
			.onStart(() => {
				if (onStart)
					onStart();
			})
			.onUpdate(() => {
				if (onUpdate)
					onUpdate(val.value);
			})
			.onComplete(() => {
				if (onComplete)
					onComplete();
			})
			.start()
	}
}