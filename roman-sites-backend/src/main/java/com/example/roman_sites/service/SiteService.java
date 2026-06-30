package com.example.roman_sites.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.roman_sites.dto.SiteResponse;
import com.example.roman_sites.mapper.SiteMapper;
import com.example.roman_sites.repository.SiteRepository;

@Service
public class SiteService {

    @Autowired
    private SiteRepository repository;
    @Autowired
    private SiteMapper siteMapper;

    public List<SiteResponse> getAllSites() {
        return repository.findAll().stream()
            .map(siteMapper::toResponse)
            .collect(Collectors.toList());
    }
}
