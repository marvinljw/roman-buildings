package com.example.roman_sites.config;

import javax.sql.DataSource;

import com.example.roman_sites.entity.User;
import com.example.roman_sites.repository.SiteRepository;
import com.example.roman_sites.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("x")) {
            User masterUser = new User();
            masterUser.setUsername("x");
            masterUser.setPassword(passwordEncoder.encode("x"));
            masterUser.setRole("ADMIN");
            userRepository.save(masterUser);
            System.out.println("Master account created: username=x, password=x");
        }

        // The database is kept on disk: the curated sites go into an empty one only, while the
        // Wikidata list is a MERGE on wikidata_id, so re-running it just adds newly imported sites.
        // Public ratings and photos are plain UPDATEs, refreshed on every start.
        long before = siteRepository.count();
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        if (before == 0) {
            populator.addScript(new ClassPathResource("seed/curated-sites.sql"));
        }
        populator.addScript(new ClassPathResource("seed/wikidata-sites.sql"));
        populator.addScript(new ClassPathResource("seed/public-ratings.sql"));
        populator.addScript(new ClassPathResource("seed/site-photos.sql"));
        populator.setSqlScriptEncoding("UTF-8");
        populator.execute(dataSource);
        long after = siteRepository.count();
        if (after > before) {
            System.out.println("Seeded " + (after - before) + " ancient sites (" + after + " in total)");
        }
    }
}
