package com.makemytrip.repository;
import com.makemytrip.model.entity.UserInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {
    List<UserInteraction> findByUserIdOrderByCreatedAtDesc(Long userId);
    @Query(value = "SELECT destination FROM user_interactions WHERE user_id = :userId AND destination IS NOT NULL GROUP BY destination ORDER BY SUM(weight) DESC LIMIT 3", nativeQuery = true)
    List<String> findTopDestinationsByUserId(Long userId);
}
