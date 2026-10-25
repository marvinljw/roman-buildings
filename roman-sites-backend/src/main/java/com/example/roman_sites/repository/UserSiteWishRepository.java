package com.example.roman_sites.repository;

import com.example.roman_sites.entity.UserSiteWish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface UserSiteWishRepository extends JpaRepository<UserSiteWish, Long> {
    boolean existsByUserIdAndSiteId(Long userId, Long siteId);

    @Query("SELECT w.site.id FROM UserSiteWish w WHERE w.user.id = :userId")
    Set<Long> findSiteIdsByUserId(Long userId);

    void deleteByUserIdAndSiteId(Long userId, Long siteId);
}
