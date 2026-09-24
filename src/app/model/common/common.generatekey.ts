import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class GenerateKeyService {

  constructor() { }

  generateUniqueFirestoreId() {
    // Alphanumeric characters
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
  }

  generateApplicationId() {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let autoId = '';
    for (let i = 0; i < 6; i++) {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
  }

  createKeywords = (name:any) => {
    const arrName:any = [];
    let curname = '';
    name.split("").forEach((letter:any) => {
      curname += letter.toLowerCase();
      arrName.push(curname);
    });
    return arrName;
  }

  generateKeywordsForBookAds = (bookName:any, publicationName:any) => {
    let bookNamekeys = this.createKeywords(bookName.toLowerCase() + "");
    let publicationNameKeys = this.createKeywords(publicationName.toLowerCase()  + "");
    let keywords = [];
    keywords.push("");
    keywords.push(...bookNamekeys);
    keywords.push(...publicationNameKeys);
    return keywords;
  }
}
