import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexNavbar } from '../components/menu-bar/index-navbar/index-navbar';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuMember } from '../components/menu-bar/menu-member/menu-member';
import { ConfigService } from '../service/api/config.service';
import { SignalrService } from '../service/api/signalr.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, IndexNavbar, CarouselModule, ButtonModule, RippleModule, MenuMember],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index implements OnInit, OnDestroy {
  currentBannerIndex: number = 0;
  slideInterval: number = 5000;
  slideTimer: any;
  isLoggedIn: boolean = false;
  resData: any;
  private resConfigSub: any;
  constructor(
    private ConfigService: ConfigService,
    private signalRService: SignalrService,
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    this.isLoggedIn = !!token;

    this.ConfigService.getConfig().subscribe((res) => {
      this.resData = res[0];
    });
    this.resConfigSub = this.signalRService.resConfig$.subscribe((updatedConfig) => {
      this.resData = updatedConfig;
    });
  }
  banners = [
    { image: 'assets/Images/Banner.png' },
    { image: 'assets/Images/Banner2.png' },
    { image: 'assets/Images/Banner3.png' },
  ];
  ngOnDestroy() {
    this.resConfigSub?.unsubscribe();
  }
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
