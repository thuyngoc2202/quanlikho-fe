export class Order {
  approved: boolean;
  id: number;
  orderBy: string
  orderDetails: OrderDetails[];
  userId: number;

  constructor() {
    this.id = 0;
    this.approved = false;
    this.orderBy = '';
    this.orderDetails = [];
    this.userId = 0;
  }
}

export class OrderDetails {
  id!: number;
  product_name: string;
  product_category_id: string;
  orderId!: number;
  quantity: number;
  category_id: string;
  category_name: string;
  stock: number;
  min_quantity: number;

  constructor() {
    this.product_name = '';
    this.product_category_id = '';
    this.quantity = 0;
    this.category_id = '';
    this.category_name = '';
    this.stock = 0;
    this.min_quantity = 0;
  }
}
export class OrderUser {
  full_name: string;
  email: string;
  phone_number: string;
  shipping_address: string;
  totalAmount: number;
  note: string;

  constructor() {
    this.full_name = '';
    this.email = '';
    this.phone_number = '';
    this.shipping_address = '';
    this.totalAmount = 0;
    this.note = '';
  }
}

export class PlaceOrderDetail {
  product_order_id: string;
  product_category_id: string;
  product_name: string;
  quantity: number;
  subtotal: number;
  category_name: string;
  stock: number;
  constructor() {
    this.product_order_id = '';
    this.product_category_id = '';
    this.product_name = '';
    this.quantity = 0;
    this.subtotal = 0;
    this.category_name = '';
    this.stock = 0;
  }
}

export class OrderManagement {
  id: number;
  full_name: string;
  email: string;
  product_order_id: string;
  phone_number: string;
  shipping_address: string;
  total_amount: number;
  note: string;
  order_date: string;
  status: string;
  user_id: string;
  tracking_number: string;
  product_order_detail_list_responses: PlaceOrderDetail[];

  constructor() {

    this.id = 0;
    this.full_name = '';
    this.email = '';
    this.product_order_id = '';
    this.phone_number = '';
    this.shipping_address = '';
    this.total_amount = 0;
    this.note = '';
    this.order_date = '';
    this.status = '';
    this.user_id = '';
    this.tracking_number = '';
    this.product_order_detail_list_responses = [];
  }
}
