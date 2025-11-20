import { TestBed } from '@angular/core/testing';

import { Luv2ShopForm } from './luv2-shop-form';

describe('Luv2ShopForm', () => {
  let service: Luv2ShopForm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Luv2ShopForm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
