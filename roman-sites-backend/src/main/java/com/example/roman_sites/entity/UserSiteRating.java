package com.example.roman_sites.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// A user's own 1-5 star rating of a site. Independent of whether they have seen it.
@Entity
@Table(name = "user_site_ratings", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "site_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSiteRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false)
    private LocalDateTime ratedDate;

    public UserSiteRating(User user, Site site, Integer rating) {
        this.user = user;
        this.site = site;
        this.rating = rating;
        this.ratedDate = LocalDateTime.now();
    }
}
