CREATE TABLE bookings (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id),
    flight_id           BIGINT REFERENCES flights(id),
    hotel_id            BIGINT REFERENCES hotels(id),
    seat_id             BIGINT REFERENCES seats(id),
    room_id             BIGINT REFERENCES rooms(id),
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    seat_class          VARCHAR(20),
    total_amount        NUMERIC(10,2) NOT NULL,
    refund_amount       NUMERIC(10,2),
    cancellation_reason VARCHAR(50),
    cancellation_note   TEXT,
    cancelled_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE TABLE payments (
    id                BIGSERIAL PRIMARY KEY,
    booking_id        BIGINT NOT NULL UNIQUE REFERENCES bookings(id),
    amount            NUMERIC(10,2) NOT NULL,
    payment_status    VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
    gateway_reference VARCHAR(255),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
