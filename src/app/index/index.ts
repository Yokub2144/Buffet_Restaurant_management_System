import { Component } from '@angular/core';
import { IndexNavbar } from '../components/menu-bar/index-navbar/index-navbar';
import { CarouselModule } from 'primeng/carousel';
@Component({
  selector: 'app-index',
  imports: [IndexNavbar, CarouselModule],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index {
  banners = [
    { image: 'assets/Images/Banner.png' },
    { image: 'assets/Images/Banner2.png' },
    { image: 'assets/Images/Banner3.png' },
  ];
}
