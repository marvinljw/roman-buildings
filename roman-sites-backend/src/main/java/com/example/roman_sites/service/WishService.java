package com.example.roman_sites.service;

import com.example.roman_sites.entity.Site;
import com.example.roman_sites.entity.User;
import com.example.roman_sites.entity.UserSiteWish;
import com.example.roman_sites.repository.SiteRepository;
import com.example.roman_sites.repository.UserRepository;
import com.example.roman_sites.repository.UserSiteWishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Service
public class WishService {

    @Autowired
    private UserSiteWishRepository wishRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Transactional
    public void add(String username, Long siteId) {
        User user = findUser(username);
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found"));
        if (!wishRepository.existsByUserIdAndSiteId(user.getId(), siteId)) {
            wishRepository.save(new UserSiteWish(user, site));
        }
    }

    @Transactional
    public void remove(String username, Long siteId) {
        User user = findUser(username);
        wishRepository.deleteByUserIdAndSiteId(user.getId(), siteId);
    }

    public Set<Long> getWishedSiteIds(String username) {
        return wishRepository.findSiteIdsByUserId(findUser(username).getId());
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
