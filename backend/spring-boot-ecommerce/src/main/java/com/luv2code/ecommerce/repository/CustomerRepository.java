package com.luv2code.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luv2code.ecommerce.entity.Customer;



public interface CustomerRepository extends JpaRepository<Customer, Long>{

    Customer findByEmail(String theEmail);

}
