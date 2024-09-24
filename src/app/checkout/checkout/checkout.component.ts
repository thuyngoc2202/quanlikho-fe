import { Component, OnInit } from '@angular/core';
import { AddressService } from 'src/app/util/addressService';
import { CustomCurrencyPipe } from 'src/app/pipe/custom-currency.pipe';
import { OrderUser } from 'src/app/model/cart-detail.model';
import { UserServiceService } from 'src/app/service/user-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  providers: [CustomCurrencyPipe]
})
export class CheckoutComponent implements OnInit {
  cartItems: any[] = [];
  total: number = 0;
  cities: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  orderUser: OrderUser = new OrderUser();
  selectedCity: string = '';
  selectedDistrict: string = '';
  selectedWard: string = '';
  orderNotes: string = '';
  constructor(private addressService: AddressService, private userService: UserServiceService, private router: Router) { }

  ngOnInit() {
    this.loadCartItems();
    this.loadCities();
  }

  loadCartItems() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      this.cartItems = JSON.parse(cartData);
      this.total = this.cartItems.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
      this.orderNotes = localStorage.getItem('orderNotes') || '';
    }
  }

  loadCities() {
    this.addressService.getCities().subscribe(
      (cities: any) => this.cities = cities
    );
  }

  onCityChange() {
    this.districts = [];
    this.wards = [];
    this.selectedDistrict = '';
    this.selectedWard = '';
    if (this.selectedCity) {
      this.addressService.getDistrictsByCity(this.selectedCity).subscribe(
        (districts: any) => {
          this.districts = districts;
        }
      );
    }
  }

  onDistrictChange() {
    if (this.selectedCity && this.selectedDistrict) {
      this.addressService.getWardsByDistrict(this.selectedCity, this.selectedDistrict).subscribe(
        (wards: any) => {
          this.wards = wards;
        }
      );
    }
  }

  placeOrder() {
    this.orderUser.totalAmount = this.total;
    this.orderUser.note = this.orderNotes;
    this.orderUser.shipping_address = this.orderUser.shipping_address + ', ' + this.selectedWard + ', ' + this.selectedDistrict + ', ' + this.selectedCity;
    this.orderUser.full_name = this.orderUser.full_name;
    this.orderUser.email = this.orderUser.email;
    this.orderUser.phone_number = this.orderUser.phone_number;

    if (this.cartItems.length > 0) {
      this.userService.placeOrder(this.orderUser).subscribe({
        next: (order: any) => {
          const orderDetails = this.cartItems.map((cartItem: any) => ({
            product_order_id: order.result_data.productOrderId,           
            product_category_id: cartItem.product_category_id,
            product_name: cartItem.product_name,
            price: cartItem.price,
            subtotal: this.total
          }));

          const orderDetailsRequest = {
            orderDetails: orderDetails
          };

          this.userService.placeOrderDetail(orderDetailsRequest.orderDetails[0]).subscribe({
            next: (orderDetail: any) => {
              localStorage.removeItem('cart');
              localStorage.removeItem('orderNotes');
              this.resetForm();

              // this.router.navigate(['/order-success']);
            },
            error: (error: any) => {
              console.error(error);
            }
          });
        },
        error: (error: any) => {
          console.error(error);
        }
      });
    } else {
      console.error('No items in cart');
    }
  }
  resetForm() {
    this.cartItems = [];
    this.total = 0;
    this.cities = [];
    this.districts = [];
    this.wards = [];
    this.orderUser = new OrderUser();
    this.selectedCity = '';
    this.selectedDistrict = '';
    this.selectedWard = '';
    this.orderNotes = '';
  }
}
