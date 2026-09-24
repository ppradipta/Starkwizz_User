import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-persona-modal',
  templateUrl: './persona-modal.component.html',
  styleUrls: ['./persona-modal.component.scss'],
})
export class PersonaModalComponent implements OnInit {
  photos = [
    {img: 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max'},
    {img: 'https://iso.500px.com/wp-content/uploads/2016/03/stock-photo-142984111.jpg'},
    {img: 'https://shotkit.com/wp-content/uploads/2021/01/nature-photography.jpg'},
    {img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw45u8HGeQQVqTYm5HXl7khHg0Y2SmyywcJw&usqp=CAU'},
    {img: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/gettyimages-907914534-1590070809.jpg'},
    {img: 'https://static.wixstatic.com/media/bb1bd6_f221ad0f4d6f4103bf1d37b68b04492e~mv2.png/v1/fill/w_1000,h_571,al_c,usm_0.66_1.00_0.01/bb1bd6_f221ad0f4d6f4103bf1d37b68b04492e~mv2.png'},
  ];
  constructor(
    public modalController: ModalController,
  ) { }

  ngOnInit() {}

  onClickClose() {
    this.modalController.dismiss();
  }
}
