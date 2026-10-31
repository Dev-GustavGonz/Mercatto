package com.mercatto.modules.ia.dto;

public class ChatIaResponse {
    private String reply;
    private String agente;
    private String proveedor;
    private boolean tokensAgotadosEnAnteriores;
    private int intentoExitoso;

    public ChatIaResponse() {}

    public ChatIaResponse(String reply, String agente, String proveedor, boolean tokensAgotadosEnAnteriores, int intentoExitoso) {
        this.reply = reply;
        this.agente = agente;
        this.proveedor = proveedor;
        this.tokensAgotadosEnAnteriores = tokensAgotadosEnAnteriores;
        this.intentoExitoso = intentoExitoso;
    }

    public String getReply() { return reply; }
    public String getRespuesta() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public String getAgente() { return agente; }
    public void setAgente(String agente) { this.agente = agente; }

    public String getProveedor() { return proveedor; }
    public void setProveedor(String proveedor) { this.proveedor = proveedor; }

    public boolean isTokensAgotadosEnAnteriores() { return tokensAgotadosEnAnteriores; }
    public void setTokensAgotadosEnAnteriores(boolean tokensAgotadosEnAnteriores) { this.tokensAgotadosEnAnteriores = tokensAgotadosEnAnteriores; }

    public int getIntentoExitoso() { return intentoExitoso; }
    public void setIntentoExitoso(int intentoExitoso) { this.intentoExitoso = intentoExitoso; }
}
