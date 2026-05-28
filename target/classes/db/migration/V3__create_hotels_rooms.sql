CREATE TABLE hotels (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    city          VARCHAR(100) NOT NULL,
    address       TEXT,
    description   TEXT,
    star_rating   INT NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
    base_price    NUMERIC(10,2) NOT NULL,
    current_price NUMERIC(10,2) NOT NULL,
    thumbnail_url TEXT,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_hotels_city ON hotels(city);

CREATE TABLE hotel_amenities (
    hotel_id BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    amenity  VARCHAR(100) NOT NULL
);

CREATE TABLE rooms (
    id               BIGSERIAL PRIMARY KEY,
    hotel_id         BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_number      VARCHAR(20) NOT NULL,
    room_type        VARCHAR(50) NOT NULL,
    max_occupancy    INT NOT NULL DEFAULT 2,
    bed_type         VARCHAR(50),
    view             VARCHAR(100),
    description      TEXT,
    preview_image_url TEXT,
    available        BOOLEAN NOT NULL DEFAULT TRUE,
    surcharge        NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    UNIQUE (hotel_id, room_number)
);
CREATE INDEX idx_rooms_hotel ON rooms(hotel_id);
