import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CustomerNavbar } from '../components/menu-bar/customer-navbar/customer-navbar';
import { Menu, MenuService } from '../service/api/menu.service';
import { CartService } from '../service/api/cart.service';

interface CartItem extends Menu {
  quantity: number;
}

@Component({
  selector: 'app-customer-order',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    CustomerNavbar,
    CarouselModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    BadgeModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './customer-order.html',
  styleUrl: './customer-order.scss',
})
export class CustomerOrder implements OnInit {
  currentBannerIndex: number = 0;
  slideInterval: number = 5000;
  slideTimer: any;

  banners = [
    { image: 'assets/Images/Banner.png' },
    { image: 'assets/Images/Banner2.png' },
    { image: 'assets/Images/Banner3.png' },
  ];
  // ----------------------------------------

  isCartVisible: boolean = false;
  tableNumber: string = 'A1'; // (อาจจะเปลี่ยนเป็น A5 หรือดึงจาก DB ในอนาคต)

  allFoodItems: Menu[] = [];
  displayItems: Menu[] = [];

  categories: string[] = ['ทั้งหมด'];
  currentCategory: string = 'ทั้งหมด';

  cart: CartItem[] = [];

  constructor(
    private messageService: MessageService,
    private menuService: MenuService,
    private cartService: CartService,
  ) {}

  ngOnInit() {
    this.loadMenus();
  }

  loadMenus() {
    this.menuService.getMenus().subscribe({
      next: (data) => {
        console.log('API Response:', data);
        this.allFoodItems = data;

        const uniqueCats = [...new Set(data.map((item) => item.category))];
        this.categories = ['ทั้งหมด', ...uniqueCats];

        this.filterCategory('ทั้งหมด');
      },
      error: (err) => {
        console.error('Error fetching menus:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'โหลดเมนูไม่สำเร็จ',
        });
      },
    });
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

  filterCategory(category: string) {
    this.currentCategory = category;
    if (category === 'ทั้งหมด') {
      this.displayItems = this.allFoodItems;
    } else {
      this.displayItems = this.allFoodItems.filter((item) => item.category === category);
    }
  }

  // (Fix โต๊ะ 5)
  addToCart(item: Menu) {
    const payload = {
      tableId: 5, // <--- FIX
      booking_id: null,
      menuId: item.menu_id,
      quantity: 1,
    };

    // ยิง API
    this.cartService.addToCart(payload).subscribe({
      next: (res) => {
        // แสดงข้อความสำเร็จ
        this.messageService.add({
          severity: 'success',
          summary: 'เพิ่มลงตะกร้าแล้ว',
          detail: item.menu_Name,
          life: 1000,
        });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'ผิดพลาด',
          detail: 'ไม่สามารถเพิ่มรายการได้',
        });
      },
    });
  }

  updateQuantity(item: CartItem, change: number) {
    const index = this.cart.indexOf(item);
    if (index === -1) return;
    item.quantity += change;
    if (item.quantity <= 0) {
      this.cart.splice(index, 1);
    }
  }

  removeItem(item: CartItem) {
    const index = this.cart.indexOf(item);
    if (index > -1) this.cart.splice(index, 1);
  }

  get cartTotalItems() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartTotalPrice() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  confirmOrder() {
    if (this.cart.length === 0) return;

    this.isCartVisible = false;
    this.messageService.add({
      severity: 'success',
      summary: 'สั่งอาหารเรียบร้อย',
      detail: 'ครัวได้รับรายการแล้ว',
    });
    this.cart = [];
  }
}
