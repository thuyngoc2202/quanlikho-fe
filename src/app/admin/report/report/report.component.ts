import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import { MatCalendar, MatDateRangePicker } from '@angular/material/datepicker';
import { saveAs } from 'file-saver';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  @ViewChild('picker') picker!: MatDateRangePicker<Date>;
  @ViewChild('startCalendar') startCalendar!: MatCalendar<Date>;
  @ViewChild('endCalendar') endCalendar!: MatCalendar<Date>;

  isExportPopupOpen: boolean = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  endDateCalendarStart: Date | null = null;

  private dateClassFunc: (date: Date) => MatCalendarCellCssClasses;

  constructor(
    private adminService: AdminServiceService, 
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    this.dateClassFunc = this.updateDateClass();
  }

  ngOnInit() {
    // Không cần gọi updateDateClass() ở đây nữa
  }

  updateDateClass(): (date: Date) => MatCalendarCellCssClasses {
    return (date: Date): MatCalendarCellCssClasses => {
      console.log('updateDateClass called', this.startDate, this.endDate);
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
    console.log('endDate', this.endDate);
    
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
    console.log('Date range:', this.startDate, this.endDate);
    // Implement your logic here
  }

  exportReport() {
    if (this.startDate && this.endDate) {
      const formattedStartDate = moment(this.startDate).format('YYYY-MM-DD');
      const formattedEndDate = moment(this.endDate).format('YYYY-MM-DD');
      console.log(formattedStartDate);
      console.log(formattedEndDate);
      this.adminService.getTopSellingProducts(formattedStartDate, formattedEndDate).subscribe({
        next: (response) => {
          if (response instanceof Blob) {
            const contentDisposition = response.type;
            let fileName = 'report.csv';
            if (contentDisposition) {
              const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
              if (fileNameMatch && fileNameMatch.length === 2)
                fileName = fileNameMatch[1];
            }
            const blob = new Blob([response], { type: 'text/csv' });
            saveAs(blob, fileName);
            this.toastr.success('Xuất báo cáo thành công', 'Thành công');
            this.closeExportPopup();
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

}
