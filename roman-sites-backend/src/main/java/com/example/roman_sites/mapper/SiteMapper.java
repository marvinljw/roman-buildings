package com.example.roman_sites.mapper;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import com.example.roman_sites.dto.SiteRequest;
import com.example.roman_sites.dto.SiteResponse;
import com.example.roman_sites.entity.Site;

@Component
public class SiteMapper {
    public SiteResponse toResponse(Site site, boolean visited) {
        return new SiteResponse(
            site.getId(),
            site.getName(),
            site.getDescription(),
            site.getCivilization().name(),
            site.getImageUrl(),
            site.getLatitude(),
            site.getLongitude(),
            site.getCountry(),
            site.getYearBuilt(),
            visited
        );
    }

    public SiteResponse toResponse(Site site) {
        return toResponse(site, false);
    }

    @NonNull
    public Site toEntity(SiteRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("SiteRequest cannot be null");
        }
        Site site = new Site();
        site.setName(request.name());
        site.setDescription(request.description());
        site.setCivilization(request.civilization());
        site.setLatitude(request.latitude());
        site.setLongitude(request.longitude());
        site.setImageUrl(request.imageUrl());
        site.setCountry(request.country());
        return site;
    }
}
