import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CustomerNavbar } from '../components/menu-bar/customer-navbar/customer-navbar';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  selected: boolean;
}

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    MatIconModule,
    ButtonModule,
    RippleModule,
    FormsModule,
    RouterModule,
    CustomerNavbar,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  cartItems: CartItem[] = [
    { id: 1, name: 'หมูหมักพริกไทยดำ', price: 0, quantity: 2, selected: true },
    { id: 2, name: 'หมูสไลด์สามชั้น', price: 0, quantity: 6, selected: true },
    { id: 3, name: 'หมูสไลด์สามชั้นแผ่น', price: 0, quantity: 5, selected: true },
    { id: 4, name: 'ผักกระหล่ำ', price: 0, quantity: 2, selected: true },
    { id: 5, name: 'สาหร่ายวากาเมะ', price: 0, quantity: 3, selected: true },
    { id: 6, name: 'เบียร์สิงห์', price: 75, quantity: 1, selected: true },
  ];

  // Logic เลือกทั้งหมด
  get isAllSelected(): boolean {
    return this.cartItems.every((item) => item.selected);
  }

  set isAllSelected(value: boolean) {
    this.cartItems.forEach((item) => (item.selected = value));
  }

  // คำนวณจำนวนรายการที่เลือก
  get totalSelectedItems(): number {
    return this.cartItems.filter((item) => item.selected).length;
  }

  // คำนวณราคารวม
  get totalPrice(): number {
    return this.cartItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // เพิ่มจำนวน
  increaseQty(item: CartItem) {
    item.quantity++;
  }

  // ลดจำนวน
  decreaseQty(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  // ลบรายการ
  removeItem(id: number) {
    this.cartItems = this.cartItems.filter((item) => item.id !== id);
  }

  // สั่งอาหาร
  placeOrder() {
    const selectedItems = this.cartItems.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      alert('กรุณาเลือกรายการอาหารอย่างน้อย 1 รายการ');
      return;
    }
    console.log('Ordering:', selectedItems);
    alert(`สั่งอาหารเรียบร้อย! ราคารวม ${this.totalPrice} บาท`);
    // TODO: เชื่อมต่อ API สั่งอาหารจริงตรงนี้
  }
}
