import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { NgxStripeModule, StripeCardComponent, StripeService } from 'ngx-stripe';
import { StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';
import { PaymentInfo } from '../../common/payment-info';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxStripeModule, StripeCardComponent],
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

  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        lineHeight: '40px',
        fontWeight: 300,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    },
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en', // Podes alterar para 'pt' se preferires
  };

  displayError: string = '';
  // -----------------------------

  constructor(
    private formBuilder: FormBuilder,
    private luv2ShopForm: Luv2ShopForm,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router,
    private stripeService: StripeService
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
      // Grupo do cartão de crédito simplificado (o Stripe valida os dados sensíveis)
      creditCard: this.formBuilder.group({
        // Podes adicionar campos aqui se quiseres guardar o nome no cartão, etc.
      }),
    });

    this.countries = Country.getAllCountries();

    // NOTA: Removemos a lógica de creditCardMonths e creditCardYears
    // porque o Stripe Elements gere a data de validade automaticamente.

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

  onSubmit(): void {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let paymentInfo = new PaymentInfo();
    paymentInfo.amount = Math.round(this.totalPrice * 100);
    paymentInfo.currency = 'EUR';

    if (!this.checkoutFormGroup.invalid && this.displayError.length === 0) {
      this.checkoutService.createPaymentIntent(paymentInfo).subscribe((paymentIntentResponse) => {
        this.stripeService
          .confirmCardPayment(
            paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.card.element,
                billing_details: {
                  email: this.checkoutFormGroup.get('customer.email')?.value,
                  name: `${this.checkoutFormGroup.get('customer.firstName')?.value} ${
                    this.checkoutFormGroup.get('customer.lastName')?.value
                  }`,
                  address: {
                    line1: this.checkoutFormGroup.get('billingAddress.street')?.value,
                    city: this.checkoutFormGroup.get('billingAddress.city')?.value,
                    state: this.checkoutFormGroup.get('billingAddress.state')?.value.name,
                    postal_code: this.checkoutFormGroup.get('billingAddress.zipCode')?.value,
                    country: this.checkoutFormGroup.get('billingAddress.country')?.value.isoCode,
                  },
                },
              },
            },
            { handleActions: false }
          )
          .subscribe({
            next: (result) => {
              if (result.error) {
                alert(`There was an error: ${result.error.message}`);
                this.displayError = result.error.message!;
              } else {
                this.placeOrder();
              }
            },
            error: (e) => {
              alert(`There was an error: ${e.message}`);
            },
          });
      });
    } else {
      this.checkoutFormGroup.markAllAsTouched();
    }
  }

  placeOrder() {
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cartService.cartItems;
    let orderItems: OrderItem[] = cartItems.map((tempCartItem) => new OrderItem(tempCartItem));

    let purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: IState = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: ICountry = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: IState = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: ICountry = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    purchase.order = order;
    purchase.orderItems = orderItems;

    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response: any) => {
        alert(
          `Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`
        );
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