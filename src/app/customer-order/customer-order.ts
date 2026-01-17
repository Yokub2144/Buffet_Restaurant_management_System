import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CustomerNavbar } from '../components/menu-bar/customer-navbar/customer-navbar';

interface FoodItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends FoodItem {
  quantity: number;
}

@Component({
  selector: 'app-customer-order',
  standalone: true,
  imports: [
    CommonModule,
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

  currentCategory: string = 'หมูสไลด์';
  isCartVisible: boolean = false;
  tableNumber: string = 'A1';

  categories = [
    'หมูหมัก',
    'หมูสไลด์',
    'ผักและอื่นๆ',
    'ของทานเล่น',
    'ทะเลซีฟู้ด',
    'เครื่องดื่ม',
    'ของหวาน',
  ];

  // ข้อมูลอาหารตัวอย่าง
  allFoodItems: FoodItem[] = [
    {
      id: 1,
      name: 'กุ้งขาว',
      price: 0,
      category: 'ทะเลซีฟู้ด',
      image: 'assets/Images/product/กุ้ง.png',
    },
    {
      id: 2,
      name: 'ปูม้า',
      price: 0,
      category: 'ทะเลซีฟู้ด',
      image: 'https://via.placeholder.com/300x300/333/fff?text=Crab',
    },
    {
      id: 3,
      name: 'ปลาหมึก',
      price: 0,
      category: 'ทะเลซีฟู้ด',
      image: 'https://via.placeholder.com/300x300/333/fff?text=Squid',
    },
    {
      id: 4,
      name: 'หมูสไลด์ชาบู',
      price: 0,
      category: 'หมูสไลด์',
      image: 'https://via.placeholder.com/300x300/333/fff?text=Pork+Shabu',
    },
    {
      id: 5,
      name: 'หมูสไลด์สันคอ',
      price: 0,
      category: 'หมูสไลด์',
      image: 'https://via.placeholder.com/300x300/333/fff?text=Pork+Neck',
    },
    {
      id: 6,
      name: 'หมูสไลด์สามชั้น',
      price: 0,
      category: 'หมูสไลด์',
      image: 'https://via.placeholder.com/300x300/333/fff?text=Pork+Belly',
    },
    {
      id: 7,
      name: 'เบียร์สิงห์',
      price: 75,
      category: 'เครื่องดื่ม',
      image: 'https://via.placeholder.com/300x300/333/fff?text=Beer',
    },
    {
      id: 8,
      name: 'ผักกาดขาว',
      price: 0,
      category: 'ผักและอื่นๆ',
      image: 'https://via.placeholder.com/300x300/333/fff?text=Veggie',
    },
  ];

  displayItems: FoodItem[] = [];
  cart: CartItem[] = [];

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.filterCategory(this.currentCategory);
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
    this.displayItems = this.allFoodItems.filter((item) => item.category === category);
  }

  addToCart(item: FoodItem) {
    const existing = this.cart.find((c) => c.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
    this.messageService.add({
      severity: 'success',
      summary: 'เพิ่มสำเร็จ',
      detail: item.name,
      life: 1000,
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
