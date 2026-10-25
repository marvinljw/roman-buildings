package com.example.roman_sites.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "ancient_sites")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Site {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    @Column(length = 2000)
    private String description;

    // Either a web URL or a data: URL for a photo uploaded in the app.
    @Lob
    private String imageUrl;

    // Photographer and licence for imageUrl (see scripts/pick-site-photos.mjs), and its Commons page.
    @Column(length = 500)
    private String imageCredit;

    @Column(length = 1000)
    private String imageSourceUrl;

    @Enumerated(EnumType.STRING)
    private Civilization civilization;

    private Double latitude;
    private Double longitude;
    private String country;
    private Integer yearBuilt;

    // Set for sites imported from Wikidata; used to link to the Wikipedia article.
    private String wikidataId;

    // 1-5 stars from open data (see scripts/compute-public-ratings.mjs); shown when the user hasn't rated it.
    private Integer publicRating;
}