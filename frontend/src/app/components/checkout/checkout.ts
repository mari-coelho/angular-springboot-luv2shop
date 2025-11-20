import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Luv2ShopForm } from '../../services/luv2-shop-form.service';
import { Country, State, ICountry, IState } from 'country-state-city';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: ICountry[] = [];
  shippingAddressStates: IState[] = [];
  billingAddressStates: IState[] = [];

  constructor(private formBuilder: FormBuilder, private luv2ShopForm: Luv2ShopForm) {}

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    this.countries = Country.getAllCountries();

    const startMonth: number = new Date().getMonth() + 1;
    this.luv2ShopForm
      .getCreditCardMonths(startMonth)
      .subscribe((data) => (this.creditCardMonths = data));
    this.luv2ShopForm.getCreditCardYears().subscribe((data) => (this.creditCardYears = data));
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

  onSubmit() {
    console.log('Handling the submit button');
    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log('Endereço de Envio:', this.checkoutFormGroup.get('shippingAddress')?.value);
    console.log(
      'País Selecionado:',
      this.checkoutFormGroup.get('shippingAddress')?.value.country.name
    );
    console.log(
      'Estado Selecionado:',
      this.checkoutFormGroup.get('shippingAddress')?.value.state.name
    );
  }
}
