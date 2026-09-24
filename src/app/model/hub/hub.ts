import { Address } from "../common/address";

export class Hub {
    public id: string='';
    public displayName: string='';
    public dealsIn: string='';
    public description: string='';
    public website: string='';
    public email: string='';
    public phoneNumber: string='';
    public whatsappNumber: string='';
    public hasNotice: boolean=false;
    public hasOffer: boolean=false;
    public imgUrl: string='';
    public locationText: string='';
    public latitude: string='';
    public longitude: string='';
    public rating: string='';
    public ratedCount: string='';
    public status: string='';
    public category: string='';//HUB
    public startTime: string='';
    public endTime: string='';
    public workingDays: any[] = [];
    public keywords: any[] = [];
    public photos: string[] = [];
}


export class HubDetails {
    public id: string='';
    public hubId:string='';
    public photos: string[] = [];
    public logoUrl: string='';
    public address: Address={} as Address;
    public SocialMediaDetails: SocialMediaDetails[] = [];

}



export class HubNotices {
    public id: string='';
    public hubId:string='';
    public photos: string='';
    public name: string='';
    public description: string='';
    public startDate: string='';
    public endDate: string='';
    public status:string='';
}



export class HubOffers{
    public id: string='';
    public hubId:string='';
    public photos: string='';
    public name:string='';
    public description: string='';
    public startDate: string='';
    public endDate: string='';
    public type:string='';//FLAT or PERCENTAGE
    public typeValue:number=0;
    public maxValue:number=0;
    public minValue:number=0;
    public status:string='';


}


export class SocialMediaDetails {
    public name: string='';
    public link: string='';
    public url: string='';
    public status: string='';
}