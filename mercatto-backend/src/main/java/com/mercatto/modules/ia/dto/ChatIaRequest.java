package com.mercatto.modules.ia.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class ChatIaRequest {
    @JsonAlias({"mensaje", "texto"})
    private String message;
    private String sessionId;

    public ChatIaRequest() {}

    public ChatIaRequest(String message, String sessionId) {
        this.message = message;
        this.sessionId = sessionId;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}
