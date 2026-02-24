export interface Employee {
  emp_id: number;
  fullname: string;
  email: string;
  phone: string;
  password?: string;
  gender: string;
  identification_Number: string;
  address: string;
  image_Profile: string;
  department: string;
  wage: number | null;
  employee_Type: string;
  employee_Status: string;
  hire_Date: Date;
  start_Time: string;
  end_Time: string;
}
