import { Component, OnInit } from '@angular/core';
import { MenuManager } from '../../../components/menu-bar/menu-manager/menu-manager';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ImageService } from '../../../service/api/image.service';

interface ImageItem {
  url: string | ArrayBuffer | null;
  file?: File;
}

interface ResImage {
  image_id: number;
  image_Url: string;
  image_Type: string;
}

@Component({
  selector: 'app-manage-shop',
  standalone: true,
  imports: [
    MenuManager,
    CommonModule,
    ToastModule,
    ButtonModule,
    RippleModule,
    ConfirmDialogModule,
  ],
  templateUrl: './manage-shop.html',
  styleUrl: './manage-shop.scss',
  providers: [ConfirmationService],
})
export class ManageShop implements OnInit {
  currentBanners: ResImage[] = [];
  currentPoster: ResImage | null = null;
  newBanners: ImageItem[] = [];
  newPoster: ImageItem | null = null;
  isLoading = false;

  constructor(
    private messageService: MessageService,
    private imageService: ImageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.imageService.getImages().subscribe({
      next: (images: ResImage[]) => {
        this.currentBanners = images.filter((img) => img.image_Type === 'Banner');
        this.currentPoster = images.find((img) => img.image_Type === 'Poster') ?? null;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'ผิดพลาด',
          detail: 'ไม่สามารถโหลดรูปภาพได้',
        });
      },
    });
  }

  onBannerUpload(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.newBanners.push({ url: reader.result, file });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  onPosterUpload(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.newPoster = { url: reader.result, file };
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  removeNewBanner(index: number): void {
    this.newBanners.splice(index, 1);
  }

  deleteExistingBanner(image: ResImage): void {
    this.confirmationService.confirm({
      message: 'ต้องการลบ Banner นี้ออกจากระบบใช่ไหม?',
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'ลบเลย',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.imageService.deleteImage(image.image_id).subscribe({
          next: () => {
            this.currentBanners = this.currentBanners.filter((b) => b.image_id !== image.image_id);
            this.messageService.add({
              severity: 'info',
              summary: 'ลบแล้ว',
              detail: 'ลบ Banner เรียบร้อย',
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'ผิดพลาด',
              detail: 'ลบไม่สำเร็จ',
            });
          },
        });
      },
    });
  }

  cancelNewPoster(): void {
    this.newPoster = null;
  }

  saveAllSettings(): void {
    if (this.newBanners.length === 0 && !this.newPoster) {
      this.messageService.add({
        severity: 'warn',
        summary: 'ไม่มีการเปลี่ยนแปลง',
        detail: 'กรุณาเพิ่มรูปภาพก่อนกดบันทึก',
      });
      return;
    }

    this.isLoading = true;
    const uploadTasks: Promise<void>[] = [];

    for (const banner of this.newBanners) {
      if (banner.file) {
        const formData = new FormData();
        formData.append('ImageFile', banner.file);
        formData.append('Image_Type', 'Banner');
        uploadTasks.push(
          new Promise((resolve, reject) => {
            this.imageService
              .uploadImage(formData)
              .subscribe({ next: () => resolve(), error: reject });
          }),
        );
      }
    }

    if (this.newPoster?.file) {
      const formData = new FormData();
      formData.append('ImageFile', this.newPoster.file);
      formData.append('Image_Type', 'Poster');

      if (this.currentPoster) {
        uploadTasks.push(
          new Promise((resolve, reject) => {
            this.imageService.updateImage(this.currentPoster!.image_id, formData).subscribe({
              next: () => resolve(),
              error: reject,
            });
          }),
        );
      } else {
        uploadTasks.push(
          new Promise((resolve, reject) => {
            this.imageService
              .uploadImage(formData)
              .subscribe({ next: () => resolve(), error: reject });
          }),
        );
      }
    }

    Promise.all(uploadTasks)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'บันทึกการตั้งค่าเรียบร้อยแล้ว',
        });
        this.newBanners = [];
        this.newPoster = null;
        this.loadImages();
      })
      .catch((err) => {
        console.error('Error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'ผิดพลาด',
          detail: 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
