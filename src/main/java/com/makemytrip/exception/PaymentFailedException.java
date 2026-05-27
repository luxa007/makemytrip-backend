package com.makemytrip.exception;
public class PaymentFailedException extends RuntimeException {
    public PaymentFailedException(String msg) { super(msg); }
}
