package com.example.roman_sites.controller;

import com.example.roman_sites.dto.ChatRequest;
import com.example.roman_sites.dto.ChatResponse;
import com.example.roman_sites.service.ChatService;
import com.example.roman_sites.service.ChatService.ChatException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request, Authentication authentication) {
        return new ChatResponse(chatService.reply(authentication.getName(), request.messages()));
    }

    // The message is safe to show the user as-is.
    @ExceptionHandler(ChatException.class)
    public ResponseEntity<Map<String, String>> handleChatError(ChatException e) {
        return ResponseEntity.status(e.getStatus()).body(Map.of("error", e.getMessage()));
    }
}
