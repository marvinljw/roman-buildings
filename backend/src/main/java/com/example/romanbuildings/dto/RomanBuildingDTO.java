package com.example.romanbuildings.dto;

public class RomanBuildingDTO {
    private Long id;
    private String name;
    private double latitude;
    private double longitude;
    private String description;
    private String imageUrl;
    private int yearBuilt;
    private String country;
    private boolean visited;

    // Constructor
    public RomanBuildingDTO(Long id, String name, double latitude, double longitude, String description, String imageUrl, int yearBuilt, String country, boolean visited) {
        this.id = id;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.description = description;
        this.imageUrl = imageUrl;
        this.yearBuilt = yearBuilt;
        this.country = country;
        this.visited = visited;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public int getYearBuilt() { return yearBuilt; }
    public void setYearBuilt(int yearBuilt) { this.yearBuilt = yearBuilt; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public boolean isVisited() { return visited; }
    public void setVisited(boolean visited) { this.visited = visited; }
}