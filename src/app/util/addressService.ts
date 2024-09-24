import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private addressData: any;
  private dataLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadAddressData();
  }

  private loadAddressData() {
    this.http.get('assets/vietnam-address.json').pipe(
      tap((data: any) => {
        this.addressData = data;
        this.dataLoaded$.next(true);
      }),
      catchError((error) => {
        console.error('Error loading address data', error);
        return of(null);
      })
    ).subscribe();
  }

  getCities(): Observable<any[]> {
    return this.dataLoaded$.pipe(
      switchMap(loaded => {
        if (loaded && this.addressData) {
          let cities: any[];
          if (Array.isArray(this.addressData)) {
            cities = this.addressData.map((city: any) => ({ id: city.code, name: city.name }));
          } else if (typeof this.addressData === 'object') {
            cities = Object.values(this.addressData).map((city: any) => ({ id: city.code, name: city.name }));
          } else {
            console.error('Unexpected address data structure');
            return of([]);
          }
          
          // Danh sách các thành phố lớn
          const majorCities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
          
          // Sắp xếp cities
          cities.sort((a, b) => {
            const aIndex = majorCities.indexOf(a.name);
            const bIndex = majorCities.indexOf(b.name);
            if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex; // Sắp xếp các thành phố lớn theo thứ tự trong majorCities
            } else if (aIndex !== -1) {
              return -1; // a là thành phố lớn, đưa lên trên
            } else if (bIndex !== -1) {
              return 1; // b là thành phố lớn, đưa lên trên
            } else {
              return a.name.localeCompare(b.name); // Sắp xếp các thành phố khác theo bảng chữ cái
            }
          });
          
          return of(cities);
        } else {
          return of([]);
        }
      })
    );
  }

  getDistrictsByCity(cityId: string): Observable<any[]> {
    return this.dataLoaded$.pipe(
      switchMap(loaded => {
        if (loaded && this.addressData) {
          const cityData = this.addressData[cityId];
          if (cityData) {
            if (cityData['quan-huyen']) {
              return of(Object.entries(cityData['quan-huyen']).map(([code, name]) => ({ id: code, name: name })));
            } else {
              console.error('Unexpected city data structure:', cityData);
              return of([]);
            }
          }
        }
        return of([]);
      })
    );
  }

  getWardsByDistrict(cityId: string, districtId: string): Observable<any[]> {
    return this.dataLoaded$.pipe(
      switchMap(loaded => {
        if (loaded && this.addressData) {
          const cityData = this.addressData[cityId];
          if (cityData && cityData['quan-huyen'] && cityData['quan-huyen'][districtId]) {
            const wardData = cityData['quan-huyen'][districtId]['xa-phuong'];
            if (wardData) {
              return of(Object.entries(wardData).map(([code, name]) => ({ id: code, name: name })));
            }
          }
        }
        return of([]);
      })
    );
  }
}