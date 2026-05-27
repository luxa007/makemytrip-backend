CREATE TABLE flights (
    id                   BIGSERIAL PRIMARY KEY,
    flight_number        VARCHAR(20) NOT NULL UNIQUE,
    airline              VARCHAR(100) NOT NULL,
    origin               VARCHAR(100) NOT NULL,
    destination          VARCHAR(100) NOT NULL,
    scheduled_departure  TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_arrival    TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_departure     TIMESTAMP WITH TIME ZONE,
    estimated_arrival    TIMESTAMP WITH TIME ZONE,
    status               VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    delay_reason         TEXT,
    base_price           NUMERIC(10,2) NOT NULL,
    current_price        NUMERIC(10,2) NOT NULL,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_flights_origin_dest ON flights(origin, destination);
CREATE INDEX idx_flights_departure ON flights(scheduled_departure);
CREATE INDEX idx_flights_status ON flights(status);

CREATE TABLE seats (
    id            BIGSERIAL PRIMARY KEY,
    flight_id     BIGINT NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    seat_number   VARCHAR(5) NOT NULL,
    seat_class    VARCHAR(20) NOT NULL,
    available     BOOLEAN NOT NULL DEFAULT TRUE,
    window        BOOLEAN NOT NULL DEFAULT FALSE,
    extra_legroom BOOLEAN NOT NULL DEFAULT FALSE,
    near_exit     BOOLEAN NOT NULL DEFAULT FALSE,
    surcharge     NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    UNIQUE (flight_id, seat_number)
);
CREATE INDEX idx_seats_flight ON seats(flight_id);
