package com.makemytrip.service;
import com.makemytrip.enums.SeatClass;
import com.makemytrip.model.dto.*;

public interface SeatSelectionService {
    SeatMapResponse getSeatMap(Long flightId);
    SeatDTO selectSeat(Long seatId, Long userId);
    RoomGridResponse getRoomGrid(Long hotelId);
    RoomDTO selectRoom(Long roomId, Long userId);
    void savePreference(Long userId, SeatClass preferredSeatClass, String preferredRoomType);
}
