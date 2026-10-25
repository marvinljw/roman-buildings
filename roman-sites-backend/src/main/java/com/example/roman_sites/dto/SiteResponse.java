package com.example.roman_sites.dto;

public record SiteResponse(
    Long id,
    String name,
    String description,
    String civilization,
    String imageUrl,
    Double latitude,
    Double longitude,
    String country,
    Integer yearBuilt,
    Boolean visited,
    String wikidataId,
    Integer myRating,
    Integer publicRating,
    String imageCredit,
    String imageSourceUrl,
    Boolean wantToVisit
) {}
