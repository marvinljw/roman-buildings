package com.example.roman_sites.controller;

import com.example.roman_sites.service.WishService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// "Want to visit" list: PUT adds a site, DELETE removes it. Both are idempotent.
@RestController
@RequestMapping("/api/sites")
@CrossOrigin(origins = "http://localhost:5173")
public class WishController {

    @Autowired
    private WishService wishService;

    @PutMapping("/{siteId}/want")
    public ResponseEntity<Void> add(@PathVariable Long siteId, Authentication authentication) {
        wishService.add(authentication.getName(), siteId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{siteId}/want")
    public ResponseEntity<Void> remove(@PathVariable Long siteId, Authentication authentication) {
        wishService.remove(authentication.getName(), siteId);
        return ResponseEntity.ok().build();
    }
}
