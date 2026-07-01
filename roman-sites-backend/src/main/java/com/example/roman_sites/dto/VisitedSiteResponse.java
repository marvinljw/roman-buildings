package com.example.roman_sites.dto;

import java.time.LocalDateTime;

public record VisitedSiteResponse(
    Long id,
    String name,
    String description,
    String civilization,
    String imageUrl,
    Double latitude,
    Double longitude,
    String country,
    Integer yearBuilt,
    LocalDateTime visitedDate
) {}
