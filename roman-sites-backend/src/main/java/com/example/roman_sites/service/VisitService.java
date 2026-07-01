package com.example.roman_sites.service;

import com.example.roman_sites.dto.VisitedSiteResponse;
import com.example.roman_sites.entity.Site;
import com.example.roman_sites.entity.User;
import com.example.roman_sites.entity.UserSiteVisit;
import com.example.roman_sites.repository.SiteRepository;
import com.example.roman_sites.repository.UserRepository;
import com.example.roman_sites.repository.UserSiteVisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class VisitService {

    @Autowired
    private UserSiteVisitRepository visitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Transactional
    public void markAsVisited(String username, Long siteId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found"));

        if (!visitRepository.existsByUserIdAndSiteId(user.getId(), siteId)) {
            UserSiteVisit visit = new UserSiteVisit(user, site);
            visitRepository.save(visit);
        }
    }

    @Transactional
    public void unmarkAsVisited(String username, Long siteId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        visitRepository.deleteByUserIdAndSiteId(user.getId(), siteId);
    }

    public List<VisitedSiteResponse> getVisitedSites(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserSiteVisit> visits = visitRepository.findByUserIdOrderByVisitedDateDesc(user.getId());

        return visits.stream()
                .map(visit -> new VisitedSiteResponse(
                        visit.getSite().getId(),
                        visit.getSite().getName(),
                        visit.getSite().getDescription(),
                        visit.getSite().getCivilization().name(),
                        visit.getSite().getImageUrl(),
                        visit.getSite().getLatitude(),
                        visit.getSite().getLongitude(),
                        visit.getSite().getCountry(),
                        visit.getSite().getYearBuilt(),
                        visit.getVisitedDate()
                ))
                .collect(Collectors.toList());
    }

    public Set<Long> getVisitedSiteIds(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return visitRepository.findVisitedSiteIdsByUserId(user.getId());
    }

    public boolean isVisited(String username, Long siteId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return visitRepository.existsByUserIdAndSiteId(user.getId(), siteId);
    }
}
