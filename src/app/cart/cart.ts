import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { CustomerNavbar } from '../components/menu-bar/customer-navbar/customer-navbar';
import { CartService } from '../service/api/cart.service';
import { TableService } from '../service/api/table.service';
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
    DialogModule
  ],
  providers: [MessageService],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  currentCartId: number = 0;
  tableNumber: string | null = null;
  tableid: number = 0;
  displayConfirm: boolean = false;
  itemToDelete: CartItem | null = null;
  pendingChange: number = 0;
  constructor(
    private cartService: CartService,
    private messageService: MessageService,
    private tableService: TableService,
  ) { }

  ngOnInit() {
    this.tableNumber = this.tableService.getTable();
    if (this.tableNumber) {
      this.gettableid(this.tableNumber);
    } else {
      console.warn('ไม่พบข้อมูลโต๊ะ');
    }
    
  }
  gettableid(tableNumber: string) {
    this.tableService.getTableid(tableNumber).subscribe({
      next: (id: number) => {
        this.tableid = id;
        console.log('ได้รหัสโต๊ะแล้ว:', this.tableid);
        this.loadCart();
      },
      error: (err) => {
        console.error('หา ID โต๊ะไม่เจอ:', err);
      }
    })
  }
  // 1. โหลดข้อมูลตะกร้าจาก DB
  loadCart() {
    console.log(this.tableid)
    if (this.tableid === 0) return;
    this.cartService.getCartItems(this.tableid).subscribe({
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
  updateCartQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;

    // กรณีที่ลดจำนวนจนเป็น 0 หรือน้อยกว่า ให้แสดง Dialog ยืนยันก่อน
    if (newQuantity <= 0) {
      if (newQuantity <= 0) {
        this.itemToDelete = item;
        this.pendingChange = change;
        this.displayConfirm = true; // เปิด p-dialog
      } else {
        // กรณีเพิ่มจำนวนปกติ หรือลดแต่ยังไม่ถึง 0
        this.processUpdate(item, change);
      }
    } else {
      // กรณีเพิ่มจำนวนปกติ หรือลดแต่ยังไม่ถึง 0
      this.processUpdate(item, change);
    }
  }

  confirmDelete() {
    if (this.itemToDelete) {
      this.processUpdate(this.itemToDelete, this.pendingChange);
      this.displayConfirm = false; // ปิด dialog
      this.itemToDelete = null;
    }
  }
  private processUpdate(item: CartItem, change: number) {
    const previousQuantity = item.quantity;
    const previousItems = [...this.cartItems]; // เก็บสำรอง List ไว้เผื่อต้อง Rollback การลบ

    // 1. Optimistic Update (เปลี่ยนค่าบน UI ทันทีเพื่อให้รู้สึกลื่นไหล)
    item.quantity += change;

    if (item.quantity <= 0) {
      this.cartItems = this.cartItems.filter((x) => x.menuId !== item.menuId);
    }

    const payload = {
      tableId: this.tableid,
      menuId: item.menuId,
      quantity: change,
      booking_id: null,
    };

    this.cartService.addToCart(payload).subscribe({
      next: () => {
        // สำเร็จ: อาจจะแสดง Toast เบาๆ หรือไม่ต้องทำอะไร
      },
      error: (err) => {
        // 2. Rollback: ถ้า Error ให้คืนค่าทั้งหมดกลับมา
        item.quantity = previousQuantity;
        this.cartItems = previousItems;

        this.messageService.add({
          severity: 'error',
          summary: 'ไม่สามารถอัปเดตได้',
          detail: 'กรุณาลองใหม่อีกครั้ง'
        });

        // ดึงข้อมูลใหม่จาก Server เพื่อความชัวร์
        this.loadCart();
      },
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
