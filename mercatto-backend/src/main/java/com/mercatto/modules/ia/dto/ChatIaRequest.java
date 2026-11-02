package com.mercatto.modules.ia.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class ChatIaRequest {
    @JsonAlias({"mensaje", "texto"})
    private String message;
    private String sessionId;

    @JsonAlias({"lang", "language", "locale"})
    private String idioma;

    public ChatIaRequest() {}

    public ChatIaRequest(String message, String sessionId) {
        this.message = message;
        this.sessionId = sessionId;
    }

    public ChatIaRequest(String message, String sessionId, String idioma) {
        this.message = message;
        this.sessionId = sessionId;
        this.idioma = idioma;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getIdioma() { return idioma; }
    public void setIdioma(String idioma) { this.idioma = idioma; }
}
