package com.example.roman_sites.service;

import com.example.roman_sites.dto.ChatRequest.ChatMessage;
import com.example.roman_sites.dto.SiteResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Talks to an OpenAI-compatible chat completions API (OpenCode). The API key never leaves the backend.
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private static final int MAX_HISTORY = 20;          // messages sent upstream per request
    private static final int MAX_MESSAGE_CHARS = 4000;  // per message
    private static final int MAX_LISTED_SITES = 250;    // per list in the user's context

    private static final String SYSTEM_PROMPT = """
            You are the friendly guide inside "Interactive Roman History Map", an app for exploring ancient \
            Roman, Greek, Egyptian, Carthaginian and Byzantine sites. Answer questions about these sites, their \
            history, architecture and how to visit them. Keep answers concise (a short paragraph or a few bullet \
            points) unless the user asks for more. If you are unsure of a fact, say so rather than guessing.
            When recommending places, prefer sites from the app's catalogue below and mention their country. \
            Ratings are 1-5 stars: the user's own rating if they gave one, otherwise a public rating based on \
            how well-known the site is.
            """;

    @Value("${opencode.api-key:}")
    private String apiKey;

    @Value("${opencode.base-url}")
    private String baseUrl;

    @Value("${opencode.model}")
    private String model;

    @Autowired
    private SiteService siteService;

    private RestClient restClient;

    // JDK HttpClient rather than HttpURLConnection, which drops the body of 401 responses
    // (the body is how we tell an expired key from a wrong one).
    private RestClient client() {
        if (restClient == null) {
            HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
            JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(http);
            factory.setReadTimeout(Duration.ofSeconds(60));
            restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
        }
        return restClient;
    }

    public String reply(String username, List<ChatMessage> history) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ChatException(HttpStatus.SERVICE_UNAVAILABLE,
                    "The AI chat isn't set up yet: add OPENCODE_API_KEY to roman-sites-backend/.env and restart the backend.");
        }
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT + "\n" + userContext(username)));
        messages.addAll(sanitise(history));
        if (messages.size() == 1) {
            throw new ChatException(HttpStatus.BAD_REQUEST, "Please type a message.");
        }

        try {
            Map<?, ?> body = client().post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + apiKey)
                    .body(Map.of("model", model, "messages", messages))
                    .retrieve()
                    .body(Map.class);
            return extractReply(body);
        } catch (RestClientResponseException e) {
            throw upstreamError(e.getStatusCode(), e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            log.warn("AI chat request failed: {}", e.getMessage());
            throw new ChatException(HttpStatus.SERVICE_UNAVAILABLE, "Couldn't reach the AI service. Please try again.");
        }
    }

    // Only user/assistant turns from the client, trimmed and capped; the system prompt is ours alone.
    private List<Map<String, String>> sanitise(List<ChatMessage> history) {
        if (history == null) return List.of();
        List<Map<String, String>> clean = history.stream()
                .filter(m -> m != null && m.content() != null && !m.content().isBlank())
                .filter(m -> "user".equals(m.role()) || "assistant".equals(m.role()))
                .map(m -> Map.of("role", m.role(), "content", truncate(m.content().trim(), MAX_MESSAGE_CHARS)))
                .collect(Collectors.toList());
        return clean.subList(Math.max(0, clean.size() - MAX_HISTORY), clean.size());
    }

    // A compact picture of what this user has seen and rated, plus top sites they haven't seen yet.
    private String userContext(String username) {
        List<SiteResponse> sites = siteService.getAllSites(username);
        List<String> seen = sites.stream()
                .filter(s -> Boolean.TRUE.equals(s.visited()))
                .map(s -> describe(s, true))
                .limit(MAX_LISTED_SITES)
                .toList();
        List<String> ratedNotSeen = sites.stream()
                .filter(s -> !Boolean.TRUE.equals(s.visited()) && s.myRating() != null)
                .map(s -> describe(s, true))
                .limit(MAX_LISTED_SITES)
                .toList();
        List<String> mustSee = sites.stream()
                .filter(s -> !Boolean.TRUE.equals(s.visited()) && effectiveRating(s) == 5)
                .map(s -> describe(s, false))
                .limit(MAX_LISTED_SITES)
                .toList();

        return "The app's catalogue has " + sites.size() + " sites.\n"
                + "Sites the user has seen (" + seen.size() + "): " + listOrNone(seen) + "\n"
                + "Sites the user rated but hasn't seen: " + listOrNone(ratedNotSeen) + "\n"
                + "5-star sites the user hasn't seen yet: " + listOrNone(mustSee);
    }

    private static int effectiveRating(SiteResponse s) {
        if (s.myRating() != null) return s.myRating();
        return s.publicRating() != null ? s.publicRating() : 0;
    }

    private static String describe(SiteResponse s, boolean withRating) {
        String rating = withRating && s.myRating() != null ? ", rated " + s.myRating() + "/5" : "";
        return s.name() + " (" + s.country() + rating + ")";
    }

    private static String listOrNone(List<String> items) {
        return items.isEmpty() ? "none" : String.join("; ", items);
    }

    private static String extractReply(Map<?, ?> body) {
        if (body != null && body.get("choices") instanceof List<?> choices && !choices.isEmpty()
                && choices.get(0) instanceof Map<?, ?> choice
                && choice.get("message") instanceof Map<?, ?> message
                && message.get("content") instanceof String content && !content.isBlank()) {
            return content.trim();
        }
        throw new ChatException(HttpStatus.BAD_GATEWAY, "The AI service sent an empty reply. Please try again.");
    }

    // Turn upstream failures into messages the user can act on (never echoing the key).
    private static ChatException upstreamError(HttpStatusCode status, String body) {
        String detail = body == null ? "" : body;
        log.warn("AI chat upstream error {}: {}", status.value(), truncate(detail, 300));
        if (detail.contains("api_key_expired")) {
            return new ChatException(HttpStatus.SERVICE_UNAVAILABLE,
                    "The OpenCode API key has expired. Create a new key in the OpenCode Console and put it in roman-sites-backend/.env.");
        }
        if (status.value() == 401) {
            return new ChatException(HttpStatus.SERVICE_UNAVAILABLE,
                    "The OpenCode API key was rejected. Check OPENCODE_API_KEY in roman-sites-backend/.env.");
        }
        if (detail.contains("FreeTierError")) {
            return new ChatException(HttpStatus.SERVICE_UNAVAILABLE,
                    "OpenCode's free models only work inside the OpenCode app. Set opencode.model to a paid model.");
        }
        if (status.value() == 402 || detail.contains("insufficient") || detail.contains("balance")) {
            return new ChatException(HttpStatus.SERVICE_UNAVAILABLE,
                    "The OpenCode account has no credit left for this model.");
        }
        if (status.value() == 429) {
            return new ChatException(HttpStatus.TOO_MANY_REQUESTS, "The AI is busy right now. Please wait a moment and try again.");
        }
        return new ChatException(HttpStatus.BAD_GATEWAY, "The AI service had a problem. Please try again.");
    }

    private static String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }

    public static class ChatException extends RuntimeException {
        private final HttpStatus status;

        public ChatException(HttpStatus status, String message) {
            super(message);
            this.status = status;
        }

        public HttpStatus getStatus() {
            return status;
        }
    }
}
