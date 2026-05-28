# MakeMyTrip Backend — Spring Boot

A production-grade travel booking platform built with Spring Boot, PostgreSQL, Redis, and WebSocket.

## Features
- ✅ Flight & Hotel booking with seat/room selection
- ✅ Cancellation & refund engine (full/50%/no refund based on timing)
- ✅ Dynamic pricing with Redis caching
- ✅ Live flight status via WebSocket + scheduler
- ✅ Review & rating system with moderation
- ✅ Personalized recommendations
- ✅ JWT authentication & role-based security
- ✅ Flyway database migrations

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.2.5 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Security | JWT + Spring Security |
| Real-time | WebSocket (STOMP) |
| Migrations | Flyway |

## Quick Start

### Prerequisites
- Java 17
- PostgreSQL
- Redis
- Maven

### Setup
```bash
# Create database
sudo -u postgres psql -c "CREATE USER mmt WITH PASSWORD 'mmt';"
sudo -u postgres psql -c "CREATE DATABASE makemytrip OWNER mmt;"

# Run
mvn spring-boot:run
```

App starts at `http://localhost:8080`

## API Endpoints

### Public
| Method | Endpoint | Description |
|---|---|---|
| GET | /actuator/health | Health check |
| GET | /api/v1/flights/{flightNumber}/status | Live flight status |
| GET | /api/v1/flights/{id}/seats | Seat map |
| GET | /api/v1/flights/{id}/pricing | Dynamic pricing |
| GET | /api/v1/hotels/{id}/rooms | Room grid |
| GET | /api/v1/reviews/flight/{id} | Flight reviews |

### Protected (JWT required)
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/bookings/{id}/cancel | Cancel booking |
| GET | /api/v1/bookings/{id}/refund-status | Refund status |
| GET | /api/v1/recommendations | Personalized recommendations |
| POST | /api/v1/seats/{id}/select | Select seat |
| POST | /api/v1/rooms/{id}/select | Select room |
| POST | /api/v1/flights/{id}/freeze-price | Freeze price |

### Admin only
| Method | Endpoint | Description |
|---|---|---|
| PUT | /api/v1/flights/{id}/status | Update flight status |
| DELETE | /api/v1/reviews/{id} | Remove review |

## Architecture Highlights
- **Pessimistic locking** on seat selection — prevents double booking
- **Optimistic locking** on bookings and reviews — prevents concurrent corruption
- **Outbox-ready** notification service — async email/SMS simulation
- **Rate-capped** dynamic pricing — max 1.20x multiplier
- **Depth-guarded** review replies — prevents infinite recursion
