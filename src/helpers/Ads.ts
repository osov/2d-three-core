export class Ads{
    public static instance:Ads;
    
    constructor(){
        Ads.instance = this;
    }

    SetDelayTime(seconds:number)
    {

    }

    IsReadyAds(seconds = 5 * 60){
        return true;
    }

    ShowBanner(idBanner = "Banner_Android"){

    }

    async ShowAds(mySurfacingId = "Interstitial_Android"){
        return true;
    }

    async ShowReward(myRewardId = "Rewarded_Android"){
        return true;
    }


}