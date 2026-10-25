package com.example.roman_sites.controller;

import com.example.roman_sites.dto.RatingRequest;
import com.example.roman_sites.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sites")
@CrossOrigin(origins = "http://localhost:5173")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PutMapping("/{siteId}/rating")
    public ResponseEntity<Void> rate(@PathVariable Long siteId, @RequestBody RatingRequest request,
                                     Authentication authentication) {
        ratingService.rate(authentication.getName(), siteId, request.rating());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{siteId}/rating")
    public ResponseEntity<Void> clear(@PathVariable Long siteId, Authentication authentication) {
        ratingService.clear(authentication.getName(), siteId);
        return ResponseEntity.ok().build();
    }
}
