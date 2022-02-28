import {GameSystem} from './systems/GameSystem';
import {Entity} from './entitys/Entity';
import {PlaneSprite} from './entitys/PlaneSprite';
import {SimpleText} from './entitys/SimpleText';
import * as gUtils from './core/gameUtils';
import { UiSprite } from './entitys/UiSprite';
import { MasterPool } from './pool/MasterPool';

interface floatMarker{isFloat?:true;}
type float = number & floatMarker;


export {gUtils, GameSystem, Entity, PlaneSprite, UiSprite, SimpleText, MasterPool, float};