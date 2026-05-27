package com.makemytrip.controller;
import com.makemytrip.enums.SeatClass;
import com.makemytrip.model.dto.*;
import com.makemytrip.service.SeatSelectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SeatSelectionController {

    private final SeatSelectionService seatSelectionService;

    @GetMapping("/flights/{flightId}/seats")
    public ResponseEntity<SeatMapResponse> getSeatMap(@PathVariable Long flightId) {
        return ResponseEntity.ok(seatSelectionService.getSeatMap(flightId));
    }

    @PostMapping("/seats/{seatId}/select")
    public ResponseEntity<SeatDTO> selectSeat(@PathVariable Long seatId, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(seatSelectionService.selectSeat(seatId, userId));
    }

    @GetMapping("/hotels/{hotelId}/rooms")
    public ResponseEntity<RoomGridResponse> getRoomGrid(@PathVariable Long hotelId) {
        return ResponseEntity.ok(seatSelectionService.getRoomGrid(hotelId));
    }

    @PostMapping("/rooms/{roomId}/select")
    public ResponseEntity<RoomDTO> selectRoom(@PathVariable Long roomId, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(seatSelectionService.selectRoom(roomId, userId));
    }

    @PostMapping("/preferences")
    public ResponseEntity<Void> savePreference(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) SeatClass seatClass,
            @RequestParam(required = false) String roomType) {
        seatSelectionService.savePreference(userId, seatClass, roomType);
        return ResponseEntity.noContent().build();
    }
}
