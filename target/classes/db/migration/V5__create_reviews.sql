CREATE TABLE reviews (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    flight_id        BIGINT REFERENCES flights(id),
    hotel_id         BIGINT REFERENCES hotels(id),
    rating           INT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title            VARCHAR(255),
    body             TEXT,
    parent_review_id BIGINT REFERENCES reviews(id),
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    helpful_count    INT         NOT NULL DEFAULT 0,
    version          BIGINT      NOT NULL DEFAULT 0,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_reviews_flight ON reviews(flight_id, status);
CREATE INDEX idx_reviews_hotel  ON reviews(hotel_id,  status);
CREATE INDEX idx_reviews_parent ON reviews(parent_review_id);

CREATE TABLE review_photos (
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    photo_url TEXT   NOT NULL
);
