CREATE TABLE price_history (
    id          BIGSERIAL PRIMARY KEY,
    flight_id   BIGINT REFERENCES flights(id),
    hotel_id    BIGINT REFERENCES hotels(id),
    price       NUMERIC(10,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_price_history_flight ON price_history(flight_id, recorded_at);
CREATE INDEX idx_price_history_hotel  ON price_history(hotel_id, recorded_at);

CREATE TABLE price_freezes (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id),
    flight_id    BIGINT REFERENCES flights(id),
    hotel_id     BIGINT REFERENCES hotels(id),
    frozen_price NUMERIC(10,2) NOT NULL,
    expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_price_freezes_user ON price_freezes(user_id, active);

CREATE TABLE user_preferences (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              BIGINT NOT NULL UNIQUE REFERENCES users(id),
    preferred_seat_class VARCHAR(20),
    preferred_room_type  VARCHAR(50),
    preferred_airline    VARCHAR(100),
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE user_interactions (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    entity_id        BIGINT NOT NULL,
    entity_type      VARCHAR(10) NOT NULL,
    interaction_type VARCHAR(10) NOT NULL,
    destination      VARCHAR(100),
    weight           INT NOT NULL DEFAULT 1,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_interactions_user ON user_interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_dest ON user_interactions(user_id, destination);

CREATE TABLE interaction_tags (
    interaction_id BIGINT NOT NULL REFERENCES user_interactions(id) ON DELETE CASCADE,
    tag            VARCHAR(50) NOT NULL
);
