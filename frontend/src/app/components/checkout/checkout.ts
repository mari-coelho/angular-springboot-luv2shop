import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Luv2ShopForm } from '../../services/luv2-shop-form.service';
import { Country, State, ICountry, IState } from 'country-state-city';
import { Luv2ShopValidators } from '../../validators/luv2-shop-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  checkoutFormGroup: FormGroup = new FormGroup({});
  submitted: boolean = false;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: ICountry[] = [];
  shippingAddressStates: IState[] = [];
  billingAddressStates: IState[] = [];

  storage: Storage = sessionStorage;

  constructor(
    private formBuilder: FormBuilder,
    private luv2ShopForm: Luv2ShopForm,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: ['', [Validators.required, Luv2ShopValidators.notOnlyWhitespace]],
        lastName: ['', [Validators.required, Luv2ShopValidators.notOnlyWhitespace]],
        email: [
          theEmail,
          [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')],
        ],
      }),
      shippingAddress: this.formBuilder.group({
        street: ['', [Validators.required, Luv2ShopValidators.notOnlyWhitespace]],
        city: ['', [Validators.required, Luv2ShopValidators.notOnlyWhitespace]],
        state: ['', [Validators.required]],
        country: ['', [Validators.required]],
        zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{4}-[0-9]{3}$')]],
      }),
      billingAddress: this.formBuilder.group({
        street: ['', [Validators.required, Luv2ShopValidators.notOnlyWhitespace]],
        city: ['', [Validators.required, Luv2ShopValidators.notOnlyWhitespace]],
        state: ['', [Validators.required]],
        country: ['', [Validators.required]],
        zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{4}-[0-9]{3}$')]],
      }),
      creditCard: this.formBuilder.group({
        cardType: ['', [Validators.required]],
        nameOnCard: ['', [Validators.required, Luv2ShopValidators.notOnlyWhitespace]],
        cardNumber: ['', [Validators.required, Validators.pattern('[0-9]{16}')]],
        securityCode: ['', [Validators.required, Validators.pattern('[0-9]{3}')]],
        expirationMonth: ['', [Validators.required]],
        expirationYear: ['', [Validators.required]],
      }),
    });

    this.countries = Country.getAllCountries();

    const startMonth: number = new Date().getMonth() + 1;
    this.luv2ShopForm
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));
    this.luv2ShopForm.getCreditCardYears().subscribe((data) => (this.creditCardYears = data));

    this.reviewCartDetails();
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.isoCode;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country selected: ${countryName}`);

    const states = State.getStatesOfCountry(countryCode);

    if (formGroupName === 'shippingAddress') {
      this.shippingAddressStates = states;
    } else {
      this.billingAddressStates = states;
    }

    if (states.length > 0) {
      formGroup?.get('state')?.setValue(states[0]);
    } else {
      formGroup?.get('state')?.setValue('');
    }
  }

  copyShippingAddressToBillingAddress(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.billingAddressStates = this.shippingAddressStates;

      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);
    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.luv2ShopForm
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));
  }

  onSubmit(): void {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    //set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cart items
    const cartItems = this.cartService.cartItems;

    //create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map((tempCartItem) => new OrderItem(tempCartItem));

    //set up purchase
    let purchase = new Purchase();

    //populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: IState = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: ICountry = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.isoCode;
    purchase.shippingAddress.country = shippingCountry.isoCode;
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: IState = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: ICountry = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.isoCode;
    purchase.billingAddress.country = billingCountry.isoCode;

    //populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    //call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response: any) => {
        alert(
          `Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`
        );

        // reset cart
        this.resetCart();
      },
      error: (err) => {
        alert(`There was an error: ${err.message}`);
      },
    });
  }

  resetCart() {

    this.cartService.resetCart();

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl('/products');
  }

  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      (totalQuantity) => (this.totalQuantity = totalQuantity)
    );
    this.cartService.totalPrice.subscribe((totalPrice) => (this.totalPrice = totalPrice));
  }
}
