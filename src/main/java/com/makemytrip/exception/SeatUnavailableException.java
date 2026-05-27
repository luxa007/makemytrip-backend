package com.makemytrip.exception;
public class SeatUnavailableException extends RuntimeException {
    public SeatUnavailableException() { super("Seat is no longer available"); }
    public SeatUnavailableException(String msg) { super(msg); }
}
