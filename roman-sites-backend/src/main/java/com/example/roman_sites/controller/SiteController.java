package com.example.roman_sites.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.roman_sites.dto.SiteResponse;
import com.example.roman_sites.service.SiteService;

@RestController
@RequestMapping("/api/sites")
public class SiteController {
    @Autowired
    private SiteService service;

    @GetMapping
    public List<SiteResponse> getAllSites() {
        return service.getAllSites();
    }
}
