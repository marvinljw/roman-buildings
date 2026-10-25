package com.example.roman_sites.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// A site the user wants to visit (their wishlist). Independent of whether they have seen it.
@Entity
@Table(name = "user_site_wishes", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "site_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSiteWish {
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
    private LocalDateTime addedDate;

    public UserSiteWish(User user, Site site) {
        this.user = user;
        this.site = site;
        this.addedDate = LocalDateTime.now();
    }
}
