package com.example.roman_sites.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.roman_sites.dto.SiteRequest;
import com.example.roman_sites.dto.SiteResponse;
import com.example.roman_sites.service.SiteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sites")
@CrossOrigin(origins = "http://localhost:5173")
public class SiteController {
    @Autowired
    private SiteService service;

    @GetMapping
    public List<SiteResponse> getAllSites(Authentication authentication) {
        String username = authentication.getName();
        return service.getAllSites(username);
    }

    @PostMapping
    public ResponseEntity<SiteResponse> createSite(@Valid @RequestBody SiteRequest request) {
        SiteResponse createdSite = service.createSite(request);
        return new ResponseEntity<>(createdSite, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteResponse> updateSite(@PathVariable Long id, @Valid @RequestBody SiteRequest request) {
        SiteResponse updatedSite = service.updateSite(id, request);
        return ResponseEntity.ok(updatedSite);
    }
}
