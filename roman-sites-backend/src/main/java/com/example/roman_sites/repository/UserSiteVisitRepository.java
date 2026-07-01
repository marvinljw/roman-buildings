package com.example.roman_sites.repository;

import com.example.roman_sites.entity.UserSiteVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserSiteVisitRepository extends JpaRepository<UserSiteVisit, Long> {
    Optional<UserSiteVisit> findByUserIdAndSiteId(Long userId, Long siteId);

    List<UserSiteVisit> findByUserIdOrderByVisitedDateDesc(Long userId);

    boolean existsByUserIdAndSiteId(Long userId, Long siteId);

    @Query("SELECT v.site.id FROM UserSiteVisit v WHERE v.user.id = :userId")
    Set<Long> findVisitedSiteIdsByUserId(Long userId);

    void deleteByUserIdAndSiteId(Long userId, Long siteId);
}
