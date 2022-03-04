import { EventBus } from "ecs-threejs";
import { PointerEventData } from "ecs-threejs/src/unityTypes/Input";
import { MeshBasicMaterial } from "three";
import { MasterPool } from "../pool/MasterPool";
import { SimpleText } from "./SimpleText";
import { UiSprite } from "./UiSprite";

export type ButtonCallback = ()=>void;

export class UiButton extends UiSprite {
    protected className = 'UiButton';
    private curText: string;
    private text:SimpleText;
    private onClickEvent:ButtonCallback;

    constructor(mat: MeshBasicMaterial, _text: string) {
        super(mat);
        this.material = mat;
        this.curText = _text;

        var text = new SimpleText(_text, 30);
        text.setColor('#fafafa')
        text.setPositionZ(0.001);
        text.setScaleXY(1 / 100, 1 / 50);
        text.setPositionXY(0, 0.1);
        this.add(text);
        this.text = text;

        EventBus.subscribeEventEntity<PointerEventData>('onPointerDown', this, this.onClick.bind(this));
        //this.addComponent(new UiKeyDown()); 
    }

    private onClick(event:PointerEventData){
        if (this.onClickEvent !== undefined)
            this.onClickEvent();
    }

    setText(text:string){
        this.curText = text;
        this.text.setText(text);
    }

    setScaleXY(x:number, y:number)
	{
		super.setScaleXY(x,y);
        this.text.setScaleXY(1/x, 1/y);
	}

    addCallback(callback:ButtonCallback){
        this.onClickEvent = callback;
    }


    makeInstance() {
        var copy = new UiButton(MasterPool.isCloneMaterial ? this.material.clone() : this.material, this.curText);
        copy.imgList = this.imgList;
        this.makeChildsInstance(copy);
        return copy;
    }
}