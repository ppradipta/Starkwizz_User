import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { ReplaySubject, finalize } from 'rxjs';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';


@Injectable({
  providedIn: 'root'
})
export class FileService {

  public uploadedImage = new ReplaySubject<any>(1);

  constructor(private storage: AngularFireStorage, private plt: Platform) {

  }

  setUploadedImage(data: any) {
    this.uploadedImage.next(data);
  }
  getUploadedImage() {
    return this.uploadedImage.asObservable();
  }



  async saveImageAndProceeForView(path: string, photo: Photo, images: any[]) {
    const base64Data = await this.readAsBase64(photo);
    const ext = photo.format;
    const d = Date.now();
    const fileName = `${d}.${ext}`;
    const savedFile = await Filesystem.writeFile({
      path: `${path}/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
      recursive: true
    });
    this.loadFiles(path, fileName, images);
  }

  private async readAsBase64(photo: any) {
    if (this.plt.is('hybrid')) {
      console.log(' readAsBase64 platform hybrid ');
      const file = await Filesystem.readFile({
        path: photo.path
      });
      console.log(' readAsBase64 platform hybrid file data return   ');
      return file.data;
    } else {
      console.log('readAsBase64  nativedata');
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob) as string;
    }

  }

  private convertBlobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }

  async loadFiles(path: string, fileName: string, images: any[]) {
    Filesystem.readdir({
      path: path,
      directory: Directory.Data
    }).then(
      (result) => {
        this.loadFileData(path, fileName, images);
      })

  }


  async loadFileData(path: string, fileName: string, images: any[]) {

    const filePath = `${path}/${fileName}`;
    const readFile = await Filesystem.readFile({
      path: filePath,
      directory: Directory.Data
    });
    images.push({
      name: fileName,
      path: filePath,
      base64: readFile.data,
      data: `data:image/jpeg;base64,${readFile.data}`
    });
    return images;
  }


  uploadImage(imageDetails: any) {
    var cacheMetaData = {
      cacheControl: 'public,max-age=40000',
    }
    return new Promise((resolve, reject) => {
      this.storage.ref('/').child(imageDetails.path).putString(imageDetails.base64, 'base64', cacheMetaData).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((url) => {
          let uploadDetails = {
            type: imageDetails.imageUploadFor,
            imageUploadFor: imageDetails.imageUploadFor,
            url: url,
            fileType: 'IMAGE'
          }
          resolve(uploadDetails);
        });
      }).catch((err) => {
        reject('failed')
        console.log(err);
      });
    });
  }

}
