package com.example.roman_sites.dto;

public record SiteResponse(
    String name,
    String description,
    String civilization,
    String imageUrl,
    Double latitude,
    Double longitude
) {}
