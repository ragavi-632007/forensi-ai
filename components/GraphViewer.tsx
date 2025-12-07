import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink } from '../types';

interface GraphViewerProps {
  data: GraphData;
}

const GraphViewer: React.FC<GraphViewerProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = window.innerWidth < 640 ? 400 : 600;

    const svg = d3.select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Simulation setup
    const simulation = d3.forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw lines for links
    const link = svg.append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value) * 2);

    // Draw circles for nodes
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", (d) => d.val + 5)
      .attr("fill", (d) => {
        if (d.group === 1) return "#ef4444"; // Target (Red)
        if (d.group === 2) return "#3b82f6"; // Contact (Blue)
        return "#10b981"; // Meta/App (Green)
      })
      .call(d3.drag<SVGCircleElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Labels
    const text = svg.append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text((d) => d.id)
      .attr("font-size", 10)
      .attr("fill", "#cbd5e1")
      .attr("dx", 12)
      .attr("dy", 4);

    node.append("title")
      .text((d) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      text
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="w-full bg-slate-850 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-cyan-400 font-semibold tracking-wide text-sm sm:text-base">RELATIONSHIP GRAPH</h3>
        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Neo4j Visualization (D3)</span>
      </div>
      <div className="w-full h-[400px] sm:h-[600px] bg-slate-900 relative">
         <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
      </div>
    </div>
  );
};

export default GraphViewer;
