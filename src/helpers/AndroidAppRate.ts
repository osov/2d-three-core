export type CallbackRate = (v: boolean) => void;

export class AndroidAppRate {
    public static instance:AndroidAppRate;
    public onRate: CallbackRate;

    constructor(){
        AndroidAppRate.instance = this;
    }

    DoRate() {
        if (this.onRate !== undefined)
            this.onRate(true);
    }
}