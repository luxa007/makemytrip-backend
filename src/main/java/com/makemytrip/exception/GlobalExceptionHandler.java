package com.makemytrip.exception;
import com.makemytrip.model.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;

@RestControllerAdvice
@lombok.extern.slf4j.Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BookingNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleBookingNotFound(BookingNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", ex.getMessage(), req);
    }

    @ExceptionHandler(SeatUnavailableException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiErrorResponse handleSeatUnavailable(SeatUnavailableException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, "SEAT_UNAVAILABLE", ex.getMessage(), req);
    }

    @ExceptionHandler(PaymentFailedException.class)
    @ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
    public ApiErrorResponse handlePaymentFailed(PaymentFailedException ex, HttpServletRequest req) {
        return build(HttpStatus.PAYMENT_REQUIRED, "PAYMENT_FAILED", ex.getMessage(), req);
    }

    @ExceptionHandler(ReviewNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleReviewNotFound(ReviewNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "REVIEW_NOT_FOUND", ex.getMessage(), req);
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleIllegalState(IllegalStateException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "INVALID_STATE", ex.getMessage(), req);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiErrorResponse handleGeneric(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception", ex); return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred", req);
    }

    private ApiErrorResponse build(HttpStatus status, String code, String message, HttpServletRequest req) {
        return ApiErrorResponse.builder()
                .timestamp(Instant.now()).status(status.value())
                .code(code).message(message).path(req.getRequestURI()).build();
    }
}
