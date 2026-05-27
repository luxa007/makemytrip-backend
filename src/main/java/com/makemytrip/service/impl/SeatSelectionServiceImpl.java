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

@Service @RequiredArgsConstructor
public class SeatSelectionServiceImpl implements SeatSelectionService {

    private final SeatRepository seatRepository;
    private final RoomRepository roomRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public SeatMapResponse getSeatMap(Long flightId) {
        List<SeatDTO> seats = seatRepository.findByFlightIdOrderBySeatNumber(flightId)
                .stream().map(this::toSeatDTO).collect(Collectors.toList());
        return SeatMapResponse.builder().flightId(flightId).seats(seats).build();
    }

    @Override @Transactional
    public SeatDTO selectSeat(Long seatId, Long userId) {
        Seat seat = seatRepository.findByIdWithLock(seatId)
                .orElseThrow(() -> new SeatUnavailableException("Seat not found: " + seatId));
        if (!seat.isAvailable()) throw new SeatUnavailableException();
        seat.setAvailable(false);
        Seat saved = seatRepository.save(seat);
        SeatDTO dto = toSeatDTO(saved);
        dto.setSelected(true);
        messagingTemplate.convertAndSend("/topic/flight/" + seat.getFlight().getFlightNumber() + "/seats", dto);
        return dto;
    }

    @Override
    public RoomGridResponse getRoomGrid(Long hotelId) {
        List<RoomDTO> rooms = roomRepository.findByHotelIdOrderByRoomType(hotelId)
                .stream().map(this::toRoomDTO).collect(Collectors.toList());
        return RoomGridResponse.builder().hotelId(hotelId).rooms(rooms).build();
    }

    @Override @Transactional
    public RoomDTO selectRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalStateException("Room not found: " + roomId));
        if (!room.isAvailable()) throw new SeatUnavailableException("Room is no longer available");
        room.setAvailable(false);
        return toRoomDTO(roomRepository.save(room));
    }

    @Override @Transactional
    public void savePreference(Long userId, SeatClass preferredSeatClass, String preferredRoomType) {
        UserPreference pref = preferenceRepository.findByUserId(userId)
                .orElse(UserPreference.builder().userId(userId).build());
        pref.setPreferredSeatClass(preferredSeatClass);
        pref.setPreferredRoomType(preferredRoomType);
        preferenceRepository.save(pref);
    }

    private SeatDTO toSeatDTO(Seat s) {
        return SeatDTO.builder().id(s.getId()).seatNumber(s.getSeatNumber()).seatClass(s.getSeatClass())
                .available(s.isAvailable()).window(s.isWindow()).extraLegroom(s.isExtraLegroom())
                .nearExit(s.isNearExit()).surcharge(s.getSurcharge()).build();
    }

    private RoomDTO toRoomDTO(Room r) {
        return RoomDTO.builder().id(r.getId()).roomNumber(r.getRoomNumber()).roomType(r.getRoomType())
                .available(r.isAvailable()).maxOccupancy(r.getMaxOccupancy()).bedType(r.getBedType())
                .view(r.getView()).surcharge(r.getSurcharge()).previewImageUrl(r.getPreviewImageUrl()).build();
    }
}
