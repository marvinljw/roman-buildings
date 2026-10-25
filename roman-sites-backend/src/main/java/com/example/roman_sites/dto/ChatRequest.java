package com.example.roman_sites.dto;

import java.util.List;

// The conversation so far, oldest first. Roles are "user" or "assistant".
public record ChatRequest(List<ChatMessage> messages) {
    public record ChatMessage(String role, String content) {}
}
