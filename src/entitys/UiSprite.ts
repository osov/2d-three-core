import { MeshBasicMaterial, Vector2 } from 'three';
import { PlaneSprite } from './PlaneSprite';
import { MasterPool } from '../pool/MasterPool';
import { Screen } from 'ecs-threejs';

export class UiSprite extends PlaneSprite {
    protected className = 'UiSprite';
    public align: Vector2 = new Vector2(0, 0);
    public srcPos: Vector2 = new Vector2();

    constructor(material: MeshBasicMaterial) {
        super(material);
    }

    setAlign(x: number, y: number) {
        this.align.set(x, y);
        this.srcPos.copy(this.get2dPosition());
    }

    protected getPosScreen(){
         let align = this.align;
         let tx = 0;
         let ty = 0;
         if (align.x == -1)
             tx = - Screen.width * 0.5;
         if (align.x == 1)
             tx = Screen.width * 0.5;
         if (align.y == -1)
             ty = - Screen.height * 0.5;
         if (align.y == 1)
             ty = Screen.height * 0.5;
         return new Vector2(tx, ty);
    }

    setPositionXY(x: number, y: number)
    {
        var ps = this.getPosScreen();
        this.position.set(ps.x + x, ps.y + y, this.position.z);
    }

    makeInstance() {
        var copy = new UiSprite(MasterPool.isCloneMaterial ? this.material.clone() : this.material);
        copy.imgList = this.imgList;
        this.makeChildsInstance(copy);
        return copy;
    }

}
