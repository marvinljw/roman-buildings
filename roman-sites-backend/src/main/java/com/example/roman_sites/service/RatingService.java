package com.example.roman_sites.service;

import com.example.roman_sites.entity.Site;
import com.example.roman_sites.entity.User;
import com.example.roman_sites.entity.UserSiteRating;
import com.example.roman_sites.repository.SiteRepository;
import com.example.roman_sites.repository.UserRepository;
import com.example.roman_sites.repository.UserSiteRatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RatingService {

    public static final int MIN_RATING = 1;
    public static final int MAX_RATING = 5;

    @Autowired
    private UserSiteRatingRepository ratingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Transactional
    public void rate(String username, Long siteId, Integer rating) {
        if (rating == null || rating < MIN_RATING || rating > MAX_RATING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Rating must be between " + MIN_RATING + " and " + MAX_RATING);
        }
        User user = findUser(username);
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found"));

        UserSiteRating existing = ratingRepository.findByUserIdAndSiteId(user.getId(), siteId)
                .orElseGet(() -> new UserSiteRating(user, site, rating));
        existing.setRating(rating);
        existing.setRatedDate(LocalDateTime.now());
        ratingRepository.save(existing);
    }

    @Transactional
    public void clear(String username, Long siteId) {
        User user = findUser(username);
        ratingRepository.deleteByUserIdAndSiteId(user.getId(), siteId);
    }

    // siteId -> rating, for every site this user has rated.
    public Map<Long, Integer> getRatings(String username) {
        User user = findUser(username);
        return ratingRepository.findByUserId(user.getId()).stream()
                .collect(Collectors.toMap(r -> r.getSite().getId(), UserSiteRating::getRating));
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
