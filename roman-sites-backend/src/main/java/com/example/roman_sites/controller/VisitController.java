package com.example.roman_sites.controller;

import com.example.roman_sites.dto.VisitedSiteResponse;
import com.example.roman_sites.service.VisitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@CrossOrigin(origins = "http://localhost:5173")
public class VisitController {

    @Autowired
    private VisitService visitService;

    @PostMapping("/{siteId}/visit")
    public ResponseEntity<Void> markAsVisited(@PathVariable Long siteId, Authentication authentication) {
        String username = authentication.getName();
        visitService.markAsVisited(username, siteId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{siteId}/visit")
    public ResponseEntity<Void> unmarkAsVisited(@PathVariable Long siteId, Authentication authentication) {
        String username = authentication.getName();
        visitService.unmarkAsVisited(username, siteId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-visited")
    public ResponseEntity<List<VisitedSiteResponse>> getMyVisitedSites(Authentication authentication) {
        String username = authentication.getName();
        List<VisitedSiteResponse> visitedSites = visitService.getVisitedSites(username);
        return ResponseEntity.ok(visitedSites);
    }
}
