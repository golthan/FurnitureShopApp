package com.furnitureapp.furnitureapi.controller;

import com.furnitureapp.furnitureapi.dto.ChangePasswordRequest;
import com.furnitureapp.furnitureapi.dto.JwtResponse;
import com.furnitureapp.furnitureapi.dto.LoginRequest;
import com.furnitureapp.furnitureapi.dto.RegisterRequest;
import com.furnitureapp.furnitureapi.entity.User;
import com.furnitureapp.furnitureapi.security.JwtUtils;
import com.furnitureapp.furnitureapi.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserService userService;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found."));

        return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getUsername(), user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        if (userService.findByUsername(registerRequest.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        // Create new user's account
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());
        user.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : "customer"); // Default to customer
                                                                                                  // role

        userService.createUser(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Lấy username từ principal (có thể là String hoặc UserDetails)
        String username;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));

        boolean changed = userService.changePassword(user.getId(), request.getCurrentPassword(),
                request.getNewPassword());

        if (changed) {
            return ResponseEntity.ok("Mật khẩu đã được thay đổi thành công!");
        } else {
            return ResponseEntity.badRequest().body("Mật khẩu hiện tại không đúng!");
        }
    }
}
