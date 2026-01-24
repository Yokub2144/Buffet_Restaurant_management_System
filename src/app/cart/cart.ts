import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CustomerNavbar } from '../components/menu-bar/customer-navbar/customer-navbar';
import { CartService } from '../service/api/cart.service';

interface CartItem {
  id: number;
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selected: boolean;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ButtonModule,
    RippleModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    ToastModule,
    CustomerNavbar,
  ],
  providers: [MessageService],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  currentCartId: number = 0;
  tableId: number = 5; // โต๊ะ 5

  constructor(
    private cartService: CartService,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  // 1. โหลดข้อมูลตะกร้าจาก DB
  loadCart() {
    this.cartService.getCartItems(this.tableId).subscribe({
      next: (res: any) => {
        this.currentCartId = res.cartId;

        // แปลงข้อมูลจาก API ให้เข้ากับ Interface ของหน้าบ้าน
        if (res.items) {
          this.cartItems = res.items.map((item: any) => ({
            id: item.id,
            menuId: item.menuId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            selected: true,
          }));
        }
      },
      error: (err) => {
        console.error('Load cart error:', err);
        // ถ้าไม่เจอ หรือ Error อาจจะแค่ console log หรือแจ้งเตือน
      },
    });
  }

  // Logic เลือกทั้งหมด
  get isAllSelected(): boolean {
    return this.cartItems.length > 0 && this.cartItems.every((item) => item.selected);
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

  // 2. เพิ่มจำนวน
  increaseQty(item: CartItem) {
    this.updateCartQuantity(item, 1);
  }

  // 3. ลดจำนวน
  decreaseQty(item: CartItem) {
    this.updateCartQuantity(item, -1);
  }
  // ฟังก์ชันกลางสำหรับยิง API บวก/ลบ
  updateCartQuantity(item: CartItem, change: number) {
    const payload = {
      tableId: this.tableId,
      menuId: item.menuId,
      quantity: change,
      booking_id: null,
    };

    this.cartService.addToCart(payload).subscribe({
      next: () => {
        item.quantity += change;
        if (item.quantity <= 0) {
          this.cartItems = this.cartItems.filter((x) => x.id !== item.id);
        }
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error' }),
    });
  }

  // 4. ลบรายการ

  removeItem(id: number) {
    this.cartService.deleteItem(id).subscribe({
      next: () => {
        // ลบออกจากหน้าจอทันที
        this.cartItems = this.cartItems.filter((item) => item.id !== id);
        this.messageService.add({ severity: 'success', summary: 'ลบสำเร็จ' });

        // ถ้าลบจนหมด ให้เคลียร์ CartId ทิ้งด้วย
        if (this.cartItems.length === 0) this.currentCartId = 0;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'ลบไม่สำเร็จ' });
      },
    });
  }

  // 5. สั่งอาหาร
  placeOrder() {
    if (this.currentCartId === 0 || this.cartItems.length === 0) return;

    this.cartService.placeOrder(this.currentCartId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'สั่งอาหารเรียบร้อย',
          detail: 'รายการถูกส่งเข้าครัวแล้ว',
        });

        this.cartItems = [];
        this.currentCartId = 0;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด' });
      },
    });
  }
}
