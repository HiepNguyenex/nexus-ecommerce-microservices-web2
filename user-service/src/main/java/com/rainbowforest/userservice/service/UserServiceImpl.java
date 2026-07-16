package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserDetails;
import com.rainbowforest.userservice.entity.UserRole;

import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.getOne(id);
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    public User saveUser(User user) {
        user.setActive(1);
        UserRole role = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
        user.setRole(role);
        user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        return userRepository.save(user);
    }

    @Override
    public User updateUserStatus(Long id, int active) {
        User user = userRepository.getOne(id);
        user.setActive(active);
        return userRepository.save(user);
    }

    @Override
    public User updateUserDetails(Long id, UserDetails details) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            UserDetails currentDetails = user.getUserDetails();
            if (currentDetails == null) {
                currentDetails = new UserDetails();
            }
            currentDetails.setFirstName(details.getFirstName());
            currentDetails.setLastName(details.getLastName());
            currentDetails.setEmail(details.getEmail());
            currentDetails.setPhoneNumber(details.getPhoneNumber());
            currentDetails.setStreet(details.getStreet());
            currentDetails.setStreetNumber(details.getStreetNumber());
            currentDetails.setZipCode(details.getZipCode());
            currentDetails.setLocality(details.getLocality());
            currentDetails.setCountry(details.getCountry());
            
            user.setUserDetails(currentDetails);
            return userRepository.save(user);
        }
        return null;
    }
}

