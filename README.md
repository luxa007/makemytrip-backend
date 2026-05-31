# MakeMyTrip Clone — Full Stack Booking Platform

Live Demo: https://makemytrip-platform.netlify.app

## Features
- ✅ Cancellation & Refund System with auto refund calculation
- ✅ Review & Rating System with photo upload and reply threading  
- ✅ Live Flight Status with WebSocket real-time updates
- ✅ Interactive Seat & Room Selection with 3D previews
- ✅ Dynamic Pricing Engine with price freeze
- ✅ Personalized Recommendations with collaborative filtering

## Tech Stack
**Backend:** Java 17, Spring Boot 3.2.5, PostgreSQL, Redis, Flyway, JWT, WebSocket  
**Frontend:** React.js, CSS Variables Design System, Netlify  
**Auth:** JWT with Spring Security  
**Docs:** Swagger UI at /swagger-ui.html

## Quick Start
```bash
# Backend
cd makemytrip
mvn spring-boot:run

# Frontend  
cd frontend
npm install && npm start
```

## Demo Login
Email: test@test.com  
Password: test123

## API Documentation
Available at http://localhost:8080/swagger-ui.html when running locally.
