package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserDetails;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;
    
    @Autowired
    private HeaderGenerator headerGenerator;
    
    @GetMapping (value = "/users")
    public ResponseEntity<List<User>> getAllUsers(){
        List<User> users =  userService.getAllUsers();
        if(!users.isEmpty()) {
        	return new ResponseEntity<List<User>>(
        		users,
        		headerGenerator.getHeadersForSuccessGetMethod(),
        		HttpStatus.OK);
        }
        return new ResponseEntity<List<User>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/users", params = "name")
    public ResponseEntity<User> getUserByName(@RequestParam("name") String userName){
    	User user = userService.getUserByName(userName);
    	if(user != null) {
    		return new ResponseEntity<User>(
    				user,
    				headerGenerator.
    				getHeadersForSuccessGetMethod(),
    				HttpStatus.OK);
    	}
        return new ResponseEntity<User>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id){
        User user = userService.getUserById(id);
        if(user != null) {
    		return new ResponseEntity<User>(
    				user,
    				headerGenerator.
    				getHeadersForSuccessGetMethod(),
    				HttpStatus.OK);
    	}
        return new ResponseEntity<User>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @PostMapping (value = "/users")
    public ResponseEntity<User> addUser(@RequestBody User user, HttpServletRequest request){
    	if(user != null)
    		try {
    			userService.saveUser(user);
    			return new ResponseEntity<User>(
    					user,
    					headerGenerator.getHeadersForSuccessPostMethod(request, user.getId()),
    					HttpStatus.CREATED);
    		}catch (Exception e) {
    			log.error("Failed to create user", e);
			throw new RuntimeException("Failed to create user", e);
		}
    	return new ResponseEntity<User>(HttpStatus.BAD_REQUEST);
    }

    @PutMapping (value = "/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable("id") Long id,
            @RequestParam("active") int active){
        User user = userService.getUserById(id);
        if(user != null) {
            try {
                User updatedUser = userService.updateUserStatus(id, active);
                return new ResponseEntity<User>(
                        updatedUser,
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            } catch (Exception e) {
                log.error("Failed to update user status", e);
                throw new RuntimeException("Failed to update user status", e);
            }
        }
        return new ResponseEntity<User>(HttpStatus.NOT_FOUND);
    }

    @PutMapping (value = "/users/{id}/details")
    public ResponseEntity<User> updateUserDetails(
            @PathVariable("id") Long id,
            @RequestBody UserDetails details) {
        User user = userService.getUserById(id);
        if (user != null) {
            try {
                User updatedUser = userService.updateUserDetails(id, details);
                return new ResponseEntity<User>(
                        updatedUser,
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            } catch (Exception e) {
                log.error("Failed to update user details", e);
                throw new RuntimeException("Failed to update user details", e);
            }
        }
        return new ResponseEntity<User>(HttpStatus.NOT_FOUND);
    }
}

