package com.rainbowforest.userservice.config;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserDetails;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles if empty
        if (userRoleRepository.count() == 0) {
            System.out.println(">> Roles table is empty. Seeding ROLE_USER and ROLE_ADMIN...");
            UserRole r1 = new UserRole();
            r1.setRoleName("ROLE_USER");
            userRoleRepository.save(r1);

            UserRole r2 = new UserRole();
            r2.setRoleName("ROLE_ADMIN");
            userRoleRepository.save(r2);
        }

        // 2. Seed Users if empty
        if (userRepository.count() == 0) {
            System.out.println(">> Users table is empty. Starting auto-seed...");
            UserRole roleUser = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
            UserRole roleAdmin = userRoleRepository.findUserRoleByRoleName("ROLE_ADMIN");

            // Seed standard user (ROLE_USER)
            UserDetails ud1 = new UserDetails();
            ud1.setFirstName("Standard");
            ud1.setLastName("User");
            ud1.setEmail("user@example.com");
            ud1.setPhoneNumber("1234567890");
            ud1.setStreet("Main St");
            ud1.setStreetNumber("123");
            ud1.setZipCode("10000");
            ud1.setLocality("New York");
            ud1.setCountry("USA");

            User u1 = new User();
            u1.setUserName("user");
            u1.setUserPassword(passwordEncoder.encode("123456"));
            u1.setActive(1);
            u1.setRole(roleUser);
            u1.setUserDetails(ud1);
            userRepository.save(u1);

            // Seed admin (ROLE_ADMIN)
            UserDetails ud2 = new UserDetails();
            ud2.setFirstName("System");
            ud2.setLastName("Admin");
            ud2.setEmail("admin@example.com");
            ud2.setPhoneNumber("0987654321");
            ud2.setStreet("Broadway");
            ud2.setStreetNumber("456");
            ud2.setZipCode("20000");
            ud2.setLocality("Los Angeles");
            ud2.setCountry("USA");

            User u2 = new User();
            u2.setUserName("admin");
            u2.setUserPassword(passwordEncoder.encode("123456"));
            u2.setActive(1);
            u2.setRole(roleAdmin);
            u2.setUserDetails(ud2);
            userRepository.save(u2);

            System.out.println(">> Database users seeded successfully!");
        } else {
            System.out.println(">> Users database already has data. Seeding skipped.");
        }
    }
}
