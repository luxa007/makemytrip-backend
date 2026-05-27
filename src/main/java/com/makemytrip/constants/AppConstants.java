package com.makemytrip.constants;
public final class AppConstants {
    private AppConstants() {}
    public static final String CACHE_FLIGHTS         = "flights";
    public static final String CACHE_HOTELS          = "hotels";
    public static final String CACHE_FLIGHT_STATUS   = "flightStatus";
    public static final String CACHE_RECOMMENDATIONS = "recommendations";
    public static final String CACHE_PRICING         = "pricing";
    public static final String JWT_HEADER            = "Authorization";
    public static final String JWT_PREFIX            = "Bearer ";
    public static final long   JWT_EXPIRY_MS         = 86_400_000L;
    public static final String API_V1                = "/api/v1";
    public static final long   FULL_REFUND_HOURS     = 48L;
    public static final long   PARTIAL_REFUND_HOURS  = 24L;
    public static final double PARTIAL_REFUND_RATE   = 0.50;
    public static final long   PRICE_FREEZE_MINUTES  = 30L;
    public static final double PEAK_PRICING_MULTIPLIER = 1.20;
    public static final int    DEFAULT_PAGE          = 0;
    public static final int    DEFAULT_PAGE_SIZE     = 20;
    public static final int    ASYNC_CORE_POOL_SIZE  = 5;
    public static final int    ASYNC_MAX_POOL_SIZE   = 20;
    public static final int    ASYNC_QUEUE_CAPACITY  = 100;
    public static final String ASYNC_THREAD_PREFIX   = "mmt-async-";
}
