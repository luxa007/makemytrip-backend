#!/bin/bash
# =============================================================================
# INDUSTRY-LEVEL FIX SCRIPT — MakeMyTrip Spring Boot
# Run from: ~/makemytrip (where pom.xml lives)
# =============================================================================
set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[FIX]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }

# Guard — must run from project root
if [ ! -f "pom.xml" ]; then
  err "Run this from ~/makemytrip (where pom.xml is). Current dir: $(pwd)"
  exit 1
fi

# =============================================================================
log "[1/8] Fix V2 migration — 'window' is a PostgreSQL reserved keyword"
# =============================================================================
cat > src/main/resources/db/migration/V2__create_flights_seats.sql << 'EOF'
CREATE TABLE flights (
    id                   BIGSERIAL PRIMARY KEY,
    flight_number        VARCHAR(20)  NOT NULL UNIQUE,
    airline              VARCHAR(100) NOT NULL,
    origin               VARCHAR(100) NOT NULL,
    destination          VARCHAR(100) NOT NULL,
    scheduled_departure  TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_arrival    TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_departure     TIMESTAMP WITH TIME ZONE,
    estimated_arrival    TIMESTAMP WITH TIME ZONE,
    status               VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED',
    delay_reason         TEXT,
    base_price           NUMERIC(10,2) NOT NULL,
    current_price        NUMERIC(10,2) NOT NULL,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version              BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_flights_origin_dest ON flights(origin, destination);
CREATE INDEX idx_flights_departure   ON flights(scheduled_departure);
CREATE INDEX idx_flights_status      ON flights(status);

CREATE TABLE seats (
    id             BIGSERIAL PRIMARY KEY,
    flight_id      BIGINT  NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    seat_number    VARCHAR(5)   NOT NULL,
    seat_class     VARCHAR(20)  NOT NULL,
    available      BOOLEAN      NOT NULL DEFAULT TRUE,
    is_window      BOOLEAN      NOT NULL DEFAULT FALSE,
    extra_legroom  BOOLEAN      NOT NULL DEFAULT FALSE,
    near_exit      BOOLEAN      NOT NULL DEFAULT FALSE,
    surcharge      NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    UNIQUE (flight_id, seat_number)
);
CREATE INDEX idx_seats_flight ON seats(flight_id);
EOF
log "  V2 migration rewritten — 'window' → 'is_window'"

# =============================================================================
log "[2/8] Fix V4 migration — add version column to bookings"
# =============================================================================
cat > src/main/resources/db/migration/V4__create_bookings_payments.sql << 'EOF'
CREATE TABLE bookings (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id),
    flight_id           BIGINT REFERENCES flights(id),
    hotel_id            BIGINT REFERENCES hotels(id),
    seat_id             BIGINT REFERENCES seats(id),
    room_id             BIGINT REFERENCES rooms(id),
    status              VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    seat_class          VARCHAR(20),
    total_amount        NUMERIC(10,2) NOT NULL,
    refund_amount       NUMERIC(10,2),
    cancellation_reason VARCHAR(50),
    cancellation_note   TEXT,
    cancelled_at        TIMESTAMP WITH TIME ZONE,
    version             BIGINT        NOT NULL DEFAULT 0,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_status      ON bookings(status);

CREATE TABLE payments (
    id                BIGSERIAL PRIMARY KEY,
    booking_id        BIGINT NOT NULL UNIQUE REFERENCES bookings(id),
    amount            NUMERIC(10,2) NOT NULL,
    payment_status    VARCHAR(30)   NOT NULL DEFAULT 'INITIATED',
    gateway_reference VARCHAR(255),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
EOF
log "  V4 migration rewritten — version column added to bookings"

# =============================================================================
log "[3/8] Fix V5 migration — add version column to reviews"
# =============================================================================
cat > src/main/resources/db/migration/V5__create_reviews.sql << 'EOF'
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
EOF
log "  V5 migration rewritten — version column added to reviews"

# =============================================================================
log "[4/8] Drop V7 migration — version columns now in V2/V4/V5, idempotency kept"
# =============================================================================
cat > src/main/resources/db/migration/V7__add_idempotency.sql << 'EOF'
-- Idempotency keys for cancellation (prevent double-refund on retry)
CREATE TABLE IF NOT EXISTS idempotency_keys (
    key        VARCHAR(255) PRIMARY KEY,
    response   TEXT         NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_idempotency_created ON idempotency_keys(created_at);
EOF
log "  V7 migration cleaned up"

# =============================================================================
log "[5/8] Fix Seat.java entity — rename 'window' field"
# =============================================================================
cat > src/main/java/com/makemytrip/model/entity/Seat.java << 'EOF'
package com.makemytrip.model.entity;

import com.makemytrip.enums.SeatClass;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "seats")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @Column(nullable = false)
    private String seatNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatClass seatClass;

    @Builder.Default
    @Column(nullable = false)
    private boolean available = true;

    @Column(name = "is_window")          // maps to is_window column
    private boolean windowSeat;          // renamed from 'window' (reserved keyword)

    @Builder.Default
    private boolean extraLegroom = false;

    @Builder.Default
    private boolean nearExit = false;

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal surcharge = BigDecimal.ZERO;
}
EOF
log "  Seat.java — 'window' → 'windowSeat' with @Column(name='is_window')"

# =============================================================================
log "[6/8] Fix SeatDTO.java — rename 'window' field"
# =============================================================================
cat > src/main/java/com/makemytrip/model/dto/SeatDTO.java << 'EOF'
package com.makemytrip.model.dto;

import com.makemytrip.enums.SeatClass;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SeatDTO {
    private Long      id;
    private String    seatNumber;
    private SeatClass seatClass;
    private boolean   available;
    private boolean   windowSeat;      // renamed from 'window'
    private boolean   extraLegroom;
    private boolean   nearExit;
    private BigDecimal surcharge;
    private boolean   selected;
}
EOF
log "  SeatDTO.java — 'window' → 'windowSeat'"

# =============================================================================
log "[7/8] Fix SeatSelectionServiceImpl — use renamed fields"
# =============================================================================
cat > src/main/java/com/makemytrip/service/impl/SeatSelectionServiceImpl.java << 'EOF'
package com.makemytrip.service.impl;

import com.makemytrip.enums.SeatClass;
import com.makemytrip.exception.SeatUnavailableException;
import com.makemytrip.model.dto.*;
import com.makemytrip.model.entity.*;
import com.makemytrip.repository.*;
import com.makemytrip.service.SeatSelectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatSelectionServiceImpl implements SeatSelectionService {

    private final SeatRepository           seatRepository;
    private final RoomRepository           roomRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final SimpMessagingTemplate    messagingTemplate;

    @Override
    public SeatMapResponse getSeatMap(Long flightId) {
        List<SeatDTO> seats = seatRepository.findByFlightIdOrderBySeatNumber(flightId)
                .stream().map(this::toSeatDTO).collect(Collectors.toList());
        return SeatMapResponse.builder().flightId(flightId).seats(seats).build();
    }

    @Override
    @Transactional
    public SeatDTO selectSeat(Long seatId, Long userId) {
        Seat seat = seatRepository.findByIdWithLock(seatId)
                .orElseThrow(() -> new SeatUnavailableException("Seat not found: " + seatId));
        if (!seat.isAvailable())
            throw new SeatUnavailableException("Seat " + seat.getSeatNumber() + " is no longer available");

        seat.setAvailable(false);
        Seat saved = seatRepository.save(seat);

        SeatDTO dto = toSeatDTO(saved);
        dto.setSelected(true);
        messagingTemplate.convertAndSend(
                "/topic/flight/" + seat.getFlight().getFlightNumber() + "/seats", dto);
        return dto;
    }

    @Override
    public RoomGridResponse getRoomGrid(Long hotelId) {
        List<RoomDTO> rooms = roomRepository.findByHotelIdOrderByRoomType(hotelId)
                .stream().map(this::toRoomDTO).collect(Collectors.toList());
        return RoomGridResponse.builder().hotelId(hotelId).rooms(rooms).build();
    }

    @Override
    @Transactional
    public RoomDTO selectRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalStateException("Room not found: " + roomId));
        if (!room.isAvailable())
            throw new SeatUnavailableException("Room " + room.getRoomNumber() + " is no longer available");
        room.setAvailable(false);
        return toRoomDTO(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void savePreference(Long userId, SeatClass preferredSeatClass, String preferredRoomType) {
        UserPreference pref = preferenceRepository.findByUserId(userId)
                .orElse(UserPreference.builder().userId(userId).build());
        pref.setPreferredSeatClass(preferredSeatClass);
        pref.setPreferredRoomType(preferredRoomType);
        preferenceRepository.save(pref);
    }

    private SeatDTO toSeatDTO(Seat s) {
        return SeatDTO.builder()
                .id(s.getId())
                .seatNumber(s.getSeatNumber())
                .seatClass(s.getSeatClass())
                .available(s.isAvailable())
                .windowSeat(s.isWindowSeat())       // fixed field name
                .extraLegroom(s.isExtraLegroom())
                .nearExit(s.isNearExit())
                .surcharge(s.getSurcharge())
                .build();
    }

    private RoomDTO toRoomDTO(Room r) {
        return RoomDTO.builder()
                .id(r.getId())
                .roomNumber(r.getRoomNumber())
                .roomType(r.getRoomType())
                .available(r.isAvailable())
                .maxOccupancy(r.getMaxOccupancy())
                .bedType(r.getBedType())
                .view(r.getView())
                .surcharge(r.getSurcharge())
                .previewImageUrl(r.getPreviewImageUrl())
                .build();
    }
}
EOF
log "  SeatSelectionServiceImpl.java — all field references fixed"

# =============================================================================
log "[8/8] Clean Flyway failed entries and reset for clean run"
# =============================================================================
sudo -u postgres psql -d makemytrip -c "
  DELETE FROM flyway_schema_history WHERE success = false;
  DELETE FROM flyway_schema_history WHERE version IN ('2','3','4','5','6','7');
" 2>/dev/null && log "  Flyway history cleaned — will re-run V2 through V7" \
  || warn "  Could not clean Flyway history — may need manual cleanup"

# =============================================================================
echo ""
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  All fixes applied. Now run:${NC}"
echo -e "${GREEN}  mvn clean compile && mvn spring-boot:run${NC}"
echo -e "${GREEN}=================================================${NC}"
echo ""
echo "What was fixed:"
echo "  [1] V2 SQL   — 'window' column renamed to 'is_window'"
echo "  [2] V4 SQL   — version column moved here from V7"
echo "  [3] V5 SQL   — version column moved here from V7"
echo "  [4] V7 SQL   — cleaned, now only has idempotency_keys"
echo "  [5] Seat.java     — field 'window' → 'windowSeat' + @Column(name='is_window')"
echo "  [6] SeatDTO.java  — field 'window' → 'windowSeat'"
echo "  [7] SeatSelectionServiceImpl — all field refs updated"
echo "  [8] Flyway history — failed/partial entries cleared"
