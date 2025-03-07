package net.geoprism.geoai.explorer.core.model;

import java.util.LinkedList;
import java.util.List;

import lombok.Data;

@Data
public class Graph {
	private List<Location> nodes = new LinkedList<Location>();
	
	private List<Edge> edges = new LinkedList<Edge>();
}
