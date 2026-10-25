package com.example.roman_sites.repository;

import com.example.roman_sites.entity.UserSiteRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSiteRatingRepository extends JpaRepository<UserSiteRating, Long> {
    Optional<UserSiteRating> findByUserIdAndSiteId(Long userId, Long siteId);

    List<UserSiteRating> findByUserId(Long userId);

    void deleteByUserIdAndSiteId(Long userId, Long siteId);
}
