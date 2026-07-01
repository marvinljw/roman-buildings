package com.example.roman_sites.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_site_visits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSiteVisit {
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
    private LocalDateTime visitedDate;

    public UserSiteVisit(User user, Site site) {
        this.user = user;
        this.site = site;
        this.visitedDate = LocalDateTime.now();
    }
}
