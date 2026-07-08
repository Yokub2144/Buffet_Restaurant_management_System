import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { Toast } from 'primeng/toast';
import { MenuServer } from "../../../components/menu-bar/menu-server/menu-server";
import { Bill } from '../../../models/bill.model';
import { Discount } from '../../../models/discount.model';
import { Table, TableWithGroup } from '../../../models/table.model';
import { BillService } from '../../../service/api/bill.service';
import { DiscountService } from '../../../service/api/discount.service';
import { SignalrService } from '../../../service/api/signalr.service';
import { TableService } from '../../../service/api/table.service';
@Component({
  selector: 'app-create-bill',
  imports: [MenuServer, CommonModule, MatIconModule, FormsModule, Toast, DialogModule],
  templateUrl: './create-bill.html',
  styleUrl: './create-bill.scss',
})
export class CreateBill {
  activeBills: Bill[] = [];
  discounts: Discount[] = [];
  tables: Table[] = [];
  selectedTables: Table[] = [];
  totaltable: number = 0;
  adultCount: number = 0;
  childCount: number = 0;
  fine_kg: number = 0;
  changeTablemode: boolean = false;
  selectedDiscount: any = 0;
  showrecordModal: boolean = false;
  showeditModal: boolean = false;
  displayconfirm: boolean = false;
  selectedBillToDelete: any = null;
  billNumbersToDelete: string = '';
  searchText: string = '';
  selectedBillForEdit: any = null;
  currentEditTableGroupString: string = '';
  constructor(
    private signalrService: SignalrService,
    private tableService: TableService,
    private billService: BillService,
    private discountService: DiscountService,
    private messageService: MessageService
  ) { }
  ngOnInit() {
    this.loadTables();
    this.loadDiscounts();
    this.loadActiveBills();
    this.signalrService.tableStatus$.subscribe((updatedTable) => {
      const index = this.tables.findIndex((t) => t.table_id === updatedTable.tableId);
      if (index !== -1) {
        this.tables[index].table_Status = updatedTable.status as 'ว่าง' | 'ติดจอง' | 'ไม่ว่าง';
      }
    });
  }
  loadTables() {
    this.tableService.getAlltables().subscribe({
      next: (response: Table[]) => {
        this.tables = response;
        this.totaltable = this.tables.length;
      },
      error: (err) => {
        console.error('โหลดข้อมูลไม่สำเร็จ:', err);
      },
    });
  }
  loadDiscounts() {
    this.discountService.getDiscount().subscribe({
      next: (response: Discount[]) => {
        this.discounts = response;
      },
      error: (err) => {
        console.error('โหลดข้อมูลส่วนลดไม่สำเร็จ:', err);
      }
    });
  }
  loadActiveBills() {
    this.billService.getBill().subscribe({
      next: (response: any[]) => { // หรือ Bill[]
        console.log('โหลดข้อมูลบิลสำเร็จ:', response);
        this.activeBills = response;

        this.activeBills.forEach(bill => {
          bill.tableNumbers = 'กำลังโหลด...';
          bill.allTables = []; // 🎯 สร้างกล่องว่างๆ รองรับเก็บข้อมูลเต็มสำหรับหน้าหลักไว้ก่อน

          // 🎯 ดึง Bill ID หลักมาใช้ในการถาม API
          if (bill.bill_id) {
            this.tableService.getTableByBillId(bill.bill_id).subscribe({
              next: (tables: any[]) => {
                if (tables && tables.length > 0) {
                  bill.allTables = tables;
                  const tableNames = tables.map(t => t.table_Number).filter(name => name);
                  if (tableNames.length > 2) {
                    bill.tableNumbers = tableNames.slice(0, 2).join(', ') + '...';
                  } else {
                    bill.tableNumbers = tableNames.join(', ');
                  }

                } else {
                  bill.tableNumbers = 'ไม่พบโต๊ะ';
                  bill.allTables = [];
                }
              },
              error: (err) => {
                console.error(`โหลดโต๊ะของบิล ${bill.bill_id} ไม่สำเร็จ:`, err);
                bill.tableNumbers = 'ข้อผิดพลาด';
                bill.allTables = [];
              }
            });
          } else {
            bill.tableNumbers = 'ไม่มีรหัสบิล';
          }
        });
      },
      error: (err) => {
        console.error('โหลดข้อมูลบิลไม่สำเร็จ:', err);
      }
    });
  }
  getdiscountName(discountId: number | null): string {
    if (discountId === null) return 'ไม่มีส่วนลด';
    const discount = this.discounts.find(d => d.discount_id === discountId);
    return discount ? discount.discount_Name : 'ไม่มีส่วนลด';
  }
  gettablebyGroupTableId(bill: any): void {
    this.tableService.getTableByBillId(bill.bill_id).subscribe({
      next: (response: TableWithGroup[]) => {
        bill.tableNumbers = response.map(t => t.table_Number).join(', ');
      },
      error: (err) => {
        console.error('โหลดข้อมูลโต๊ะตามกลุ่มไม่สำเร็จ:', err);
        return [];
      }
    });
  }
  saveEditedBill() {
    const billId = this.selectedBillForEdit.bill_id;
    const payload = {
      config_id: 30001, // สามารถระบุค่าเริ่มต้นของสิทธิ์หรือดึงจาก ConfigService หลักของระบบคุณได้ครับ
      table_ids: this.selectedTables.map(t => t.table_id), // แปลงอาร์เรย์วัตถุโต๊ะให้เหลือเฉพาะกลุ่ม ID เลข int
      emp_id: 1,
      numAdults: this.adultCount,
      numChildren: this.childCount,
      discount_id: Number(this.selectedDiscount) === 0 ? null : Number(this.selectedDiscount), // ล็อกค่าแบบแปลงเป็น Null เมื่อระบุไม่มีส่วนลด
      fine_kg: this.fine_kg // เพิ่มค่าปรับใน payload
    };

    this.billService.updateBill(billId, payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: res.message || 'แก้ไขบิลสำเร็จ!'
        });
        this.showeditModal = false;
        this.clearForm();
        this.loadActiveBills(); // โหลดข้อมูลบิลใหม่หลังจากแก้ไข
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการแก้ไขบิล:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'ผิดพลาด',
          detail: err.error?.message || 'เกิดข้อผิดพลาดในการแก้ไขบิล'
        });
      }
    });
  }
  confirm() {
    if (!this.selectedBillToDelete || !this.selectedBillToDelete.bill_id) return;

    const billId = this.selectedBillToDelete.bill_id;

    this.billService.deleteBill(billId).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted Successfully',
          detail: 'ลบข้อมูลบิลเรียบร้อยแล้ว',
          life: 3000,
        });
        this.displayconfirm = false;
        this.selectedBillToDelete = null;
        this.loadActiveBills(); // โหลดข้อมูลบิลใหม่หลังจากลบ
      },
      error: (err) => {
        const errorMessage = err?.error?.message || 'เกิดข้อผิดพลาดในการลบบิล';
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: errorMessage,
        });
      },
    });
  }

  deleteBill(bill: Bill) {
    this.displayconfirm = true;
    this.selectedBillToDelete = bill;
    this.billNumbersToDelete = bill.tableNumbers || '';

  }
  toggleTableSelection(table: Table) {
    if (!this.isTableSelectable(table)) return;

    const index = this.selectedTables.findIndex((t) => t.table_id === table.table_id);
    if (index > -1) {
      this.selectedTables.splice(index, 1);
    } else {
      this.selectedTables.push(table);
    }

    this.selectedTables.sort((a, b) =>
      a.table_Number.localeCompare(b.table_Number, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  }

  isSelected(table: Table): boolean {
    return this.selectedTables.some((t) => t.table_id === table.table_id);
  }

  getSelectedTableString(): string {
    if (this.selectedTables.length === 0) return '-';
    return this.selectedTables.map((t) => t.table_Number).join(', ');
  }

  togglerecordModal(show: boolean) {
    this.showrecordModal = show;
  }
  openEditModal(bill: any) {
    this.currentEditTableGroupString = 'กำลังโหลดข้อมูลโต๊ะ...';
    this.selectedBillForEdit = bill;
    this.selectedBillForEdit.allTables = [];

    this.adultCount = bill.numAdults;
    this.childCount = bill.numChildren;
    this.selectedDiscount = bill.discount_id || 0;
    this.fine_kg = bill.fine_kg;
    this.showeditModal = true;

    if (bill.bill_id) {
      this.tableService.getTableByBillId(bill.bill_id).subscribe({
        next: (tables: any[]) => {
          console.log('ข้อมูลโต๊ะที่ได้จาก API (สำหรับ Modal):', tables);

          if (tables && tables.length > 0) {
            this.selectedBillForEdit.allTables = tables;
            this.currentEditTableGroupString = tables
              .map(t => t.table_Number)
              .filter(name => name)
              .join(', '); // ผลลัพธ์: "A2, A3, A4" (โชว์ครบหมดไม่โดนตัด ... เหมือนหน้าแรก)

          } else {
            this.currentEditTableGroupString = 'ไม่พบข้อมูลโต๊ะในบิลนี้';
            this.selectedBillForEdit.allTables = [];
          }
        },
        error: (err) => {
          console.error('โหลดข้อมูลกลุ่มโต๊ะไม่สำเร็จ:', err);
          this.currentEditTableGroupString = 'เกิดข้อผิดพลาดในการโหลดโต๊ะ';
          this.selectedBillForEdit.allTables = [];
        }
      });
    } else {
      this.currentEditTableGroupString = 'บิลนี้ไม่มีรหัสบิล';
    }
  }
  confirmRecord() {
    if (this.selectedTables.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'คำเตือน',
        detail: 'กรุณาเลือกโต๊ะก่อนบันทึกข้อมูล',
      });
      return;
    }

    if (this.adultCount <= 0 && this.childCount <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'คำเตือน',
        detail: 'กรุณากรอกจำนวนผู้เข้าใช้บริการ (ผู้ใหญ่ หรือ เด็ก อย่างน้อย 1 คน)',
      });
      return;
    }

    const payload = {
      config_id: 30001,
      table_ids: this.selectedTables.map(t => t.table_id),
      emp_id: 1,
      numAdults: this.adultCount,
      numChildren: this.childCount,
      discount_id: Number(this.selectedDiscount) === 0 ? null : Number(this.selectedDiscount) // ล็อกค่าแบบแปลงเป็น Null เมื่อระบุไม่มีส่วนลด
    };

    this.billService.createWalkInBill(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'สร้างบิลสำเร็จ',
        });
        this.togglerecordModal(false);
        this.clearForm();
        this.loadTables();
        this.loadActiveBills();
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการเปิดบิล:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'เกิดข้อผิดพลาดในการสร้างบิล',
        });
      }
    });
  }
  clearForm() {
    this.selectedTables = [];
    this.adultCount = 0;
    this.childCount = 0;
    this.selectedDiscount = 0;
  }
  get filteredActiveBills(): Bill[] {
    if (!this.searchText.trim()) {
      return this.activeBills;
    }

    const search = this.searchText.toLowerCase().trim();

    return this.activeBills.filter(bill => {
      const matchText = bill.tableNumbers && bill.tableNumbers.toLowerCase().includes(search);
      const matchInAllTables = bill.allTables && bill.allTables.some(t =>
        t.table_Number && t.table_Number.toLowerCase().includes(search)
      );


      return matchText || matchInAllTables;
    });
  }

  openChangeTableModal() {
    this.changeTablemode = true;
    this.showeditModal = false;
    this.selectedTables = [];

    if (this.selectedBillForEdit && this.selectedBillForEdit.allTables) {
      const currentTableIds = this.selectedBillForEdit.allTables.map((t: any) => t.table_id);
      this.selectedTables = this.tables.filter(t => currentTableIds.includes(t.table_id));
    }
  }

  cancelChangeTableMode() {
    this.changeTablemode = false;
    this.selectedTables = [];
    this.showeditModal = true;
  }

  confirmChangeTable() {
    if (this.selectedTables.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'คำเตือน',
        detail: 'กรุณาเลือกโต๊ะอย่างน้อย 1 โต๊ะ',
      });
      return;
    }
    const billId = this.selectedBillForEdit.bill_id;
    const payload = {
      table_ids: this.selectedTables.map(t => t.table_id)
    }

    this.tableService.ChangeTable(billId, payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: res.message || 'เปลี่ยนโต๊ะสำเร็จ!'
        });
        this.changeTablemode = false;
        this.selectedTables = [];
        this.loadActiveBills();
        this.loadTables();
      }
      ,
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการเปลี่ยนโต๊ะ:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'ผิดพลาด',
          detail: err.error?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนโต๊ะ'
        });
      }
    });

  }
  isTableSelectable(table: any): boolean {
    if (this.changeTablemode) {
      const isBelongsToCurrentBill = this.selectedBillForEdit?.allTables?.some((t: any) => t.table_id === table.table_id);
      return table.table_Status === 'ว่าง' || isBelongsToCurrentBill;
    }
    return table.table_Status === 'ว่าง';
  }
}
