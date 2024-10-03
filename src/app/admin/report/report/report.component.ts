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

  isExportPopupOpen: boolean = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  endDateCalendarStart: Date | null = null;
  showCalendar = false;
  tempStartDate: Date | null = null;
  tempEndDate: Date | null = null;
  private dateClassFunc: (date: Date) => MatCalendarCellCssClasses;
  
  isExportBuPopupOpen = false;
  startDateBu!: Date;
  endDateBu!: Date;

  constructor(
    private adminService: AdminServiceService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    public router: Router
  ) {
    this.dateClassFunc = this.updateDateClass();
  }

  ngOnInit() {
    // Không cần gọi updateDateClass() ở đây nữa
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
      this.adminService.getTopSellingProducts(formattedStartDate, formattedEndDate).subscribe({
        next: (response) => {
          if (response instanceof Blob) {
            const contentDisposition = response.type;
            let fileName = `Báo cáo bán hàng ${formattedStartDate} ${formattedEndDate}.csv`;
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

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) {
      this.tempStartDate = this.startDate;
      this.tempEndDate = this.endDate;
    }
  }

  cancelDateSelection() {
    this.tempStartDate = this.startDate;
    this.tempEndDate = this.endDate;
    this.showCalendar = false;
  }
  openExportBuPopup() {
    this.isExportBuPopupOpen = true;
    this.initializeBuDates();
  }

  closeExportBuPopup() {
    this.isExportBuPopupOpen = false;
  }

  getDateRangeStringBu(): string {
    const start = this.datePipe.transform(this.startDateBu, 'dd/MM/yyyy');
    const end = this.datePipe.transform(this.endDateBu, 'dd/MM/yyyy');
    return `${start} - ${end}`;
  }

  exportBuReport() {
    // Implement the logic to export the "nhập bù" report
    this.adminService.getBuReport().subscribe({
      next: (response) => {
        if (response instanceof Blob) {
          const contentDisposition = response.type;
          let fileName = 'Nhập bù Hàng.csv';
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (fileNameMatch && fileNameMatch.length === 2)
              fileName = fileNameMatch[1];
          }
          const blob = new Blob([response], { type: 'text/csv' });
          saveAs(blob, fileName);
          this.toastr.success('Xuất báo cáo nhập bù thành công', 'Thành công');
          this.closeExportBuPopup();
        }
      },
      error: (err) => {
        this.toastr.error('Xuất báo cáo nhập bù thất bại', 'Thất bại');
      }
    });
  }

  initializeBuDates() {
    this.endDateBu = new Date(); // Today
    this.startDateBu = new Date(this.endDateBu);
    this.startDateBu.setMonth(this.startDateBu.getMonth() - 1); // 1 month ago
  }
}
