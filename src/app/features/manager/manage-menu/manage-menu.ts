import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Menu, MenuService } from '../../../service/api/menu.service';
import { lastValueFrom } from 'rxjs';
import { MenuManager } from '../../../components/menu-bar/menu-manager/menu-manager';
@Component({
  selector: 'app-manage-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    MenuManager,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './manage-menu.html',
  styleUrl: './manage-menu.scss',
})
export class ManageMenu implements OnInit {
  menus: Menu[] = [];
  menuDialog: boolean = false;

  menu: Menu = this.getEmptyMenu();
  isEditMode: boolean = false;

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private menuService: MenuService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    this.loadMenus();
  }

  loadMenus() {
    this.menuService.getMenus().subscribe({
      next: (data) => (this.menus = data),
      error: (err) => console.error('Error loading menus', err),
    });
  }

  openNew() {
    this.menu = this.getEmptyMenu();
    this.isEditMode = false;
    this.menuDialog = true;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  editMenu(menu: Menu) {
    this.menu = { ...menu };
    this.isEditMode = true;
    this.menuDialog = true;
    this.selectedFile = null;

    if (this.menu.menu_Image) {
      const imgPath = String(this.menu.menu_Image);
      if (
        imgPath.startsWith('http') ||
        imgPath.startsWith('https') ||
        imgPath.startsWith('data:image')
      ) {
        this.imagePreview = imgPath;
      } else {
        this.imagePreview = 'assets/Images/product/' + imgPath;
      }
    } else {
      this.imagePreview = null;
    }
  }

  deleteMenu(menu: Menu) {
    this.confirmationService.confirm({
      message: `คุณแน่ใจหรือไม่ที่จะลบเมนู "${menu.menu_Name}"?`,
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.menuService.deleteMenu(menu.menu_id).subscribe({
          next: () => {
            this.loadMenus();
            this.messageService.add({
              severity: 'success',
              summary: 'สำเร็จ',
              detail: 'ลบเมนูเรียบร้อยแล้ว',
            });
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({
              severity: 'error',
              summary: 'ผิดพลาด',
              detail: 'ไม่สามารถลบเมนูได้',
            });
          },
        });
      },
    });
  }

  hideDialog() {
    this.menuDialog = false;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.menu.menu_Image = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveMenu() {
    if (!this.menu.menu_Name?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'แจ้งเตือน',
        detail: 'กรุณากรอกชื่อเมนูอาหาร',
      });
      return;
    }

    const formData = new FormData();
    formData.append('Menu_Name', this.menu.menu_Name);
    formData.append('Category', this.menu.category || '');
    formData.append('Menu_Type', this.menu.menu_Type || '');
    formData.append('Price', this.menu.price ? this.menu.price.toString() : '0');

    if (this.selectedFile) {
      formData.append('ImageFile', this.selectedFile, this.selectedFile.name);
    }

    try {
      if (this.isEditMode && this.menu.menu_id) {
        const response = await lastValueFrom(
          this.menuService.updateMenu(this.menu.menu_id, formData),
        );
        console.log('Update Response:', response);

        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'อัปเดตข้อมูลเมนูและรูปภาพเรียบร้อยแล้ว',
        });
      } else {
        const response = await lastValueFrom(this.menuService.createMenu(formData));
        console.log('Create Response:', response);

        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'เพิ่มเมนูใหม่เรียบร้อยแล้ว',
        });
      }
      this.loadMenus();
      this.menuDialog = false;
    } catch (error: any) {
      console.error('API Error:', error);
      const errorMessage = error.error?.message || 'ไม่สามารถบันทึกเมนูได้ กรุณาลองใหม่';

      this.messageService.add({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: errorMessage,
      });
    }
  }
  getEmptyMenu(): Menu {
    return {
      menu_id: 0,
      menu_Name: '',
      price: 0,
      category: '',
      menu_Image: '',
      menu_Type: '',
    } as Menu;
  }

  getImageUrl(imagePath: any): string {
    if (!imagePath) return 'assets/Images/default-food.png';
    const path = String(imagePath);
    if (path.startsWith('http') || path.startsWith('https') || path.startsWith('data:image')) {
      return path;
    }
    return 'assets/Images/product/' + path;
  }
}
