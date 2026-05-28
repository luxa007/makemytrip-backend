package com.makemytrip.service;
import com.makemytrip.model.dto.BookingRequest;
import com.makemytrip.model.dto.BookingResponse;
public interface BookingService {
    BookingResponse createBooking(BookingRequest request);
}
