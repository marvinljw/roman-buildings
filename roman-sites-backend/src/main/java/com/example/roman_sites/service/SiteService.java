package com.example.roman_sites.service;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.example.roman_sites.dto.SiteRequest;
import com.example.roman_sites.dto.SiteResponse;
import com.example.roman_sites.entity.Site;
import com.example.roman_sites.mapper.SiteMapper;
import com.example.roman_sites.repository.SiteRepository;

@Service
public class SiteService {

    @Autowired
    private SiteRepository repository;
    @Autowired
    private SiteMapper siteMapper;
    @Autowired
    private VisitService visitService;

    public List<SiteResponse> getAllSites(String username) {
        Set<Long> visitedSiteIds = visitService.getVisitedSiteIds(username);

        return repository.findAll().stream()
                .map(site -> siteMapper.toResponse(site, visitedSiteIds.contains(site.getId())))
                .collect(Collectors.toList());
    }

    public SiteResponse createSite(SiteRequest request) {
        Objects.requireNonNull(request, "Request must not be null");

        Site site = siteMapper.toEntity(request);
        Site savedSite = repository.save(site);
        return siteMapper.toResponse(savedSite);
    }

    public SiteResponse updateSite(Long id, SiteRequest request) {
        Site site = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + id));

        site.setName(request.name());
        site.setDescription(request.description());
        site.setCivilization(request.civilization());
        site.setLatitude(request.latitude());
        site.setLongitude(request.longitude());
        site.setImageUrl(request.imageUrl());
        site.setCountry(request.country());
        site.setYearBuilt(request.yearBuilt());

        Site updatedSite = repository.save(site);
        return siteMapper.toResponse(updatedSite);
    }
}
