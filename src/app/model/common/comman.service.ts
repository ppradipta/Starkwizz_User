import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })

export class CommonService {
    
    uniqueArray(target: Array<any>, property: any): Array<any> {
        return target.filter((item, index) =>
          index === target.findIndex(t =>
            t[property] === item[property]
          )
        );
      }
}


