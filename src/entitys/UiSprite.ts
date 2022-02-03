import { MeshBasicMaterial, Vector2 } from 'three';
import { PlaneSprite } from './PlaneSprite';

export class UiSprite extends PlaneSprite {
    public align: Vector2 = new Vector2(0, 0);
    public srcPos: Vector2 = new Vector2();

    constructor(material: MeshBasicMaterial) {
        super(material);
    }

    setAlign(x: number, y: number) {
        this.align.set(x, y);
        this.srcPos.copy(this.get2dPosition());
    }

    makeInstance() {
        var copy = new UiSprite(this.material);
        this.makeChildsInstance(copy);
        return copy;
    }

}
