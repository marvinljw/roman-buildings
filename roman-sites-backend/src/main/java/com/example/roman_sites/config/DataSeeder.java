package com.example.roman_sites.config;

import com.example.roman_sites.entity.User;
import com.example.roman_sites.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
    }
}
