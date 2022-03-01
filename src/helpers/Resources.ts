import { BaseHelper } from "./BaseHelper";

export class Resources extends BaseHelper {
   public static instance:Resources;

    init() {
        Resources.instance = this;
    }

    public static Load(path:string)
    {
        
    }



}