export interface Table {
  table_id: number;
  table_Number: string;
  table_Status: 'ว่าง' | 'ติดจอง' | 'ไม่ว่าง';
  table_QR_Code: string;
}
export interface TableWithGroup extends Table {
  groupTable_id: number;
  groupTable_Name: string;
}