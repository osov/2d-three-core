export class JsonHelper {

    private data: any;

    constructor(text: string) {
        this.data = JSON.parse(text);
    }

    public getKeys() {
        var keys: string[] = [];
        for (var k in this.data)
            keys.push(k);
        return keys;
    }

    public getValues() {
        var values: string[] = [];
        for (var k in this.data)
        values.push(this.data[k]);
        return values;
    }

    public setParent(key:string){
        this.data = this.data[key];
    }

    public getList(){
        var arr:string[] = [];
        for(var k in this.data){
            arr.push(this.data[k]);
        }
        return arr;
    }

    public get<T>() {
        return this.data as T;
    }
}