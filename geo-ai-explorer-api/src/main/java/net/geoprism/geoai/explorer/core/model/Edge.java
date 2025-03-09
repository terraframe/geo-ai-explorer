package net.geoprism.geoai.explorer.core.model;

import lombok.Data;

@Data
public class Edge {
    private String source;
    private String target;
    private String type;

    public Edge(String source, String target, String type) {
        this.source = source;
        this.target = target;
        this.type = type;
    }
}

