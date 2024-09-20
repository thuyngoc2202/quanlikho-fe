import { Component, OnInit } from '@angular/core';

interface Attribute {
  id: number;
  attribute_name: string;
  attribute_parent_id: string;
  attribute_type: string;
}

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.css']
})
export class AttributeComponent implements OnInit {
  constructor() { }
  attributes: Attribute[] = [
    {
      id: 1,
      attribute_name: 'Màu sắc',
      attribute_parent_id: 'A123',
      attribute_type: 'COLOR'
    },
    {
      id: 2,
      attribute_name: 'Size',
      attribute_parent_id: 'A125',
      attribute_type: 'SIZE'
    },
    {
      id: 3,
      attribute_name: 'Kích thước',
      attribute_parent_id: 'A126',
      attribute_type: 'DIMENSION'
    },
  ];

  ngOnInit(): void {
  }

  isPopupOpen = false;

  openAddAttributePopup() {
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
  }

  addAttribute() {

  }



}
