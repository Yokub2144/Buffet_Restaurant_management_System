import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexNavbar } from '../components/menu-bar/index-navbar/index-navbar';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, IndexNavbar, CarouselModule, ButtonModule, RippleModule],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index {
  currentBannerIndex: number = 0;
  slideInterval: number = 5000;
  slideTimer: any;

  banners = [
    { image: 'assets/Images/Banner.png' },
    { image: 'assets/Images/Banner2.png' },
    { image: 'assets/Images/Banner3.png' },
  ];

  onClicksmailPictures(index: number) {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
    this.currentBannerIndex = index;
    this.slideInterval = 0;
  }

  onBannerChange(event: any) {
    this.currentBannerIndex = event.page;
  }

  scrollToSection(element: HTMLElement): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }
}
