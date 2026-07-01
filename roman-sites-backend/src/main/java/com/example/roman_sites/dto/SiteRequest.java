package com.example.roman_sites.dto;

import com.example.roman_sites.entity.Civilization;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SiteRequest(
    @NotBlank(message = "Name is required")
    String name,
    
    @NotBlank(message = "Description is required")
    String description,
    
    @NotNull(message = "Civilization is required")
    Civilization civilization,
    
    @NotNull(message = "Latitude is required")
    Double latitude,
    
    @NotNull(message = "Longitude is required")
    Double longitude,

    String imageUrl,

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country name must not exceed 100 characters")
    String country,

    Integer yearBuilt
) {}