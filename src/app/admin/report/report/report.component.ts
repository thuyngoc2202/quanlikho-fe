import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import { MatCalendar, MatDateRangePicker } from '@angular/material/datepicker';
import { saveAs } from 'file-saver';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { Category } from 'src/app/model/category.model';
import { UserServiceService } from 'src/app/service/user-service.service';



@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  providers: [DatePipe]
})
export class ReportComponent implements OnInit {

  @ViewChild('picker') picker!: MatDateRangePicker<Date>;
  @ViewChild('startCalendar') startCalendar!: MatCalendar<Date>;
  @ViewChild('endCalendar') endCalendar!: MatCalendar<Date>;
  @ViewChild('startCalendarBu') startCalendarBu!: MatCalendar<Date>;
  @ViewChild('endCalendarBu') endCalendarBu!: MatCalendar<Date>;

  isExportPopupOpen: boolean = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  endDateCalendarStart: Date | null = null;
  startDateCalendarStart: Date | null = null;

  showCalendar = false;
  tempStartDate: Date | null = null;
  tempEndDate: Date | null = null;
  private dateClassFunc: (date: Date) => MatCalendarCellCssClasses;
  private dateClassFuncBu: (date: Date) => MatCalendarCellCssClasses;
  private dateClassFuncEndBu: (date: Date) => MatCalendarCellCssClasses;

  isExportBuPopupOpen = false;
  startDateBu: Date | null = null;
  endDateBu: Date | null = null;
  showCalendarBu = false;
  today: Date = new Date();

  categories: Category[] = [];
  selectedCategory: string = 'all';

 
  constructor(
    private adminService: AdminServiceService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    public router: Router,
    private userService: UserServiceService
  ) {
    this.dateClassFunc = this.updateDateClass();
    this.dateClassFuncBu = this.updateDateClassBu();
    this.dateClassFuncEndBu = this.updateDateClassEndCalendarBu();
  }

  ngOnInit() {
    // Không cần gọi updateDateClass() ở đây nữa
    this.getCategory();
    this.selectedCategory = 'all';
  }

  getCategory() {
    this.userService.getCategory().subscribe((data: any) => {
      this.categories = data.result_data;

      
    });
  }


  getDateRangeString(): string {
    if (this.startDate && this.endDate) {
      const start = moment(this.startDate).format('DD/MM/YYYY');
      const end = moment(this.endDate).format('DD/MM/YYYY');
      return `${start} - ${end}`;
    }
    return '';
  }

  updateDateClass(): (date: Date) => MatCalendarCellCssClasses {
    return (date: Date): MatCalendarCellCssClasses => {
      if (this.startDate && this.endDate) {
        if (date >= this.startDate && date <= this.endDate) {
          return 'selected-date-range mat-calendar-body-in-range';
        }
      }
      return '';
    };
  }

  get dateClass(): (date: Date) => MatCalendarCellCssClasses {
    return this.dateClassFunc;
  }
  get dateClassBu(): (date: Date) => MatCalendarCellCssClasses {
    return this.dateClassFuncBu;
  }
  get dateClassEndCalendarBu(): (date: Date) => MatCalendarCellCssClasses {
    return this.dateClassFuncEndBu;
  }

  openExportPopup() {
    this.isExportPopupOpen = true;
    // Initialize endDateCalendarStart to next month if not set
    this.clearDateRange();
    if (!this.endDateCalendarStart) {
      this.endDateCalendarStart = new Date();
      this.endDateCalendarStart.setMonth(this.endDateCalendarStart.getMonth() + 1);
    }
  }

  closeExportPopup() {
    this.isExportPopupOpen = false;
    this.showCalendar = false;
    this.selectedCategory = 'all';
    this.clearDateRange();
  }

  clearDateRange() {
    this.startDate = null;
    this.endDate = null;
    this.endDateCalendarStart = null;
  }

  onStartDateSelected(event: Date | null) {
    if (event) {
      this.startDate = event;
      this.endDateCalendarStart = new Date(event);
      this.endDateCalendarStart.setMonth(this.endDateCalendarStart.getMonth() + 1);

      if (this.endDate && this.endDate < event) {
        this.endDate = null;
      }
    } else {
      this.startDate = null;
      this.endDateCalendarStart = null;
    }
    this.dateClassFunc = this.updateDateClass();
    this.updateCalendars();
  }

  onEndDateSelected(event: Date | null) {
    this.endDate = event;

    this.dateClassFunc = this.updateDateClass();
    this.updateCalendars();
  }

  private updateCalendars() {
    if (this.startCalendar) {
      this.startCalendar.updateTodaysDate();
    }
    if (this.endCalendar) {
      this.endCalendar.updateTodaysDate();
    }
    this.cdr.detectChanges();
  }

  applyDateRange() {
    this.showCalendar = false;
  }

  exportReport() {
    if (this.startDate && this.endDate) {
      const formattedStartDate = moment(this.startDate).format('YYYY-MM-DD');
      const formattedEndDate = moment(this.endDate).format('YYYY-MM-DD');
      this.adminService.getTopSellingProducts(formattedStartDate, formattedEndDate,this.selectedCategory).subscribe({
        next: (response) => {
          if (response instanceof Blob) {
            let fileName = `Báo cáo bán hàng ${formattedStartDate} ${formattedEndDate}.csv`;
            
            const reader = new FileReader();
            reader.onload = () => {
              let csvContent = reader.result as string;
              
              // Thêm BOM (Byte Order Mark) để Windows nhận diện là UTF-8
              const BOM = '\uFEFF';
              csvContent = BOM + csvContent;
              
              // Đảm bảo rằng các giá trị được phân cách bằng dấu phẩy
              csvContent = csvContent.replace(/;/g, ',');
              
              // Tạo Blob mới với nội dung đã được xử lý
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              
              // Lưu file
              saveAs(blob, fileName);
              this.toastr.success('Xuất báo cáo thành công', 'Thành công');
              this.closeExportPopup();
            };
            reader.readAsText(response);
          }
        },
        error: (err) => {
          this.toastr.error('Xuất báo cáo thất bại', 'Thất bại');
        }
      });
    } else {
      this.toastr.warning('Vui lòng chọn phạm vi ngày', 'Cảnh báo');
    }
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) {
      this.tempStartDate = this.startDate;
      this.tempEndDate = this.endDate;
    }
    this.startDateCalendarStart = new Date(this.today.getFullYear(), this.today.getMonth() - 1, 1);
    
  }

  cancelDateSelection() {
    this.startDate = null;
    this.endDate = null;
    this.showCalendar = false;
  }
  openExportBuPopup() {
    this.isExportBuPopupOpen = true;
    this.initializeBuDates();
  }

  closeExportBuPopup() {
    this.isExportBuPopupOpen = false;
    this.showCalendarBu = false;
    this.selectedCategory = 'all';
    this.clearDateRangeBu();
  }

  clearDateRangeBu() {
    this.startDateBu = null;
  }

  getDateRangeStringBu(): string {
    if (this.startDateBu && this.endDateBu) {
      const start = moment(this.startDateBu).format('DD/MM/YYYY');
      const end = moment(this.endDateBu).format('DD/MM/YYYY');
      return `${start} - ${end}`;
    }
    return '';
  }

  exportBuReport() {
    const formattedEndDate = moment(this.endDateBu).format('YYYY-MM-DD');
    const formattedStartDate = moment(this.startDateBu).format('YYYY-MM-DD');
    this.adminService.getBuReport(formattedStartDate, this.selectedCategory).subscribe({
      next: (response: Blob) => {
        if (response instanceof Blob) {
          let fileName = `Nhập bù hàng ${formattedEndDate}.csv`;
          
          const reader = new FileReader();
          reader.onload = () => {
            let csvContent = reader.result as string;
            
            // Thêm BOM (Byte Order Mark) để Windows nhận diện là UTF-8
            const BOM = '\uFEFF';
            csvContent = BOM + csvContent;
            
            // Đảm bảo rằng các giá trị được phân cách bằng dấu phẩy
            csvContent = csvContent.replace(/;/g, ',');
            
            // Tạo Blob mới với nội dung đã được xử lý
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            
            // Lưu file
            saveAs(blob, fileName);
            this.toastr.success('Xuất báo cáo thành công', 'Thành công');
            this.closeExportBuPopup();
          };
          reader.readAsText(response);
        }
      },
      error: (err) => {
        this.toastr.error('Xuất báo cáo nhập bù thất bại', 'Thất bại');
      }
    });
  }


  initializeBuDates() {
    this.endDateBu = new Date();
    this.today = new Date();
  }

  toggleCalendarBu() {
    this.showCalendarBu = !this.showCalendarBu;
  }

  updateDateClassBu(): (date: Date) => MatCalendarCellCssClasses {
    return (date: Date): MatCalendarCellCssClasses => {

      if (this.startDateBu && this.endDateBu) {
        if (date >= this.startDateBu && date <= this.endDateBu) {
          return 'selected-date-range mat-calendar-body-in-range';
        }
      }
      return '';
    };
  }

  updateDateClassEndCalendarBu(): (date: Date) => MatCalendarCellCssClasses {
    return (date: Date): MatCalendarCellCssClasses => {
      
      let classes: string[] = [];
  
      // Luôn thêm 'disabled-date' cho tất cả các ngày trừ ngày hiện tại
      if (date.getTime() !== this.today.getTime()) {
        classes.push('disabled-date');
      }
  
      // Kiểm tra và thêm class cho phạm vi ngày được chọn
      if (this.startDateBu && date >= this.startDateBu && date <= this.today) {
        classes.push('selected-date-range', 'mat-calendar-body-in-range');
      }
  
      return classes.join(' ');
    };
  }

  onStartDateBuSelected($event: Date | null) {
    if ($event) {
      this.startDateBu = $event;

  
      // Đảm bảo ngày kết thúc luôn là ngày hiện tại
      this.endDateBu = new Date();
  
      // Nếu ngày bắt đầu sau ngày hiện tại, đặt nó là ngày hiện tại
      if (this.startDateBu > this.today) {
        this.startDateBu = new Date(this.today);
      }
    } else {
      this.startDateBu = null;
      this.endDateBu = new Date(); // Đặt lại ngày kết thúc là ngày hiện tại
    }
  
    // Cập nhật các hàm dateClass
    this.dateClassFuncBu = this.updateDateClassBu();
    this.dateClassFuncEndBu = this.updateDateClassEndCalendarBu();
  
    // Cập nhật calendars
    this.updateCalendarsBu();
  }

  private updateCalendarsBu() {
    if (this.startCalendarBu) {
      this.startCalendarBu.updateTodaysDate();
    }
    if (this.endCalendarBu) {
      this.endCalendarBu.updateTodaysDate();
    }
    this.cdr.detectChanges();
  }
}
