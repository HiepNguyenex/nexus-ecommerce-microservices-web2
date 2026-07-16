package com.rainbowforest.userservice.service;

import java.util.List;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserDetails;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(Long id);
    User getUserByName(String userName);
    User saveUser(User user);
    User updateUserStatus(Long id, int active);
    User updateUserDetails(Long id, UserDetails details);
}

