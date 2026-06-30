package com.example.roman_sites.mapper;

import org.springframework.stereotype.Component;

import com.example.roman_sites.dto.SiteResponse;
import com.example.roman_sites.entity.Site;

@Component
public class SiteMapper {
    public SiteResponse toResponse(Site site) {
        return new SiteResponse(
            site.getName(),
            site.getDescription(),
            site.getCivilization().name(),
            site.getImageUrl(),
            site.getLatitude(),
            site.getLongitude()
        );
    }
}
