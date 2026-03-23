function simulate(data, svg) {
    const width  = parseInt(svg.attr("viewBox").split(' ')[2]);
    const height = parseInt(svg.attr("viewBox").split(' ')[3]);

    // ── Color palette by cluster label ──────────────────────────────────────
    const CLUSTER_COLORS = {
        '0': '#e6194b',  // red
        '1': '#3cb44b',  // green
        '2': '#4363d8',  // blue
        '3': '#f58231',  // orange
        '4': '#911eb4',  // purple
        '5': '#42d4f4',  // cyan
        '6': '#f032e6',  // magenta
        '7': '#bfef45',  // lime
        '8': '#fabed4',  // pink
        '9': '#469990',  // teal
    };

    // ── Radius scale (sqrt so area ∝ degree) ────────────────────────────────
    const scale_radius = d3.scaleSqrt()
        .domain(d3.extent(data.nodes, d => d.degree))
        .range([5, 28]);

    const main_group = svg.append("g");

    // ── Cluster node counts (for banner) ─────────────────────────────────────
    const cluster_counts = d3.rollup(data.nodes, v => v.length, d => String(d.cluster_label));

    // ── Info banner — fixed to SVG, not affected by zoom/pan ─────────────────
    const banner_group = svg.append("g").attr("class", "banner").style("opacity", 0);

    banner_group.append("rect")
        .attr("x", width / 2 - 120)
        .attr("y", 18)
        .attr("width", 240)
        .attr("height", 36)
        .attr("rx", 8)
        .attr("fill", "rgba(0,0,0,0.55)");

    const banner_text = banner_group.append("text")
        .attr("x", width / 2)
        .attr("y", 42)
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", "14px")
        .style("fill", "#fff");

    // ── Links ────────────────────────────────────────────────────────────────
    const link_elements = main_group.append("g")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line");

    // ── Node groups ──────────────────────────────────────────────────────────
    const node_elements = main_group.append("g")
        .selectAll("g")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr("class", d => "node gr_" + String(d.cluster_label))
        .on("mouseenter", function(event, d) {
            const cluster = String(d.cluster_label);
            node_elements
                .classed("inactive", true)
                .classed("active",   false);
            d3.selectAll(".gr_" + cluster)
                .classed("inactive", false)
                .classed("active",   true);

            banner_text.text(`Cluster ${cluster} — ${cluster_counts.get(cluster)} nodes`);
            banner_group.style("opacity", 1);
        })
        .on("mouseleave", function() {
            node_elements
                .classed("inactive", false)
                .classed("active",   false);
            banner_group.style("opacity", 0);
        });

    // ── Circles colored by cluster ───────────────────────────────────────────
    node_elements.append("circle")
        .attr("r",    d => scale_radius(d.degree))
        .attr("fill", d => CLUSTER_COLORS[String(d.cluster_label)] || '#aaaaaa');

    // ── Labels — size proportional to node radius, positioned above circle ──
    node_elements.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("dy", d => -(scale_radius(d.degree)- 15))
        .style("font-size", d => Math.max(6, scale_radius(d.degree) * 0.65) + "px")
        .text(d => d.id); //.split('@')[0]);

    // ── Drag behavior ────────────────────────────────────────────────────────
    node_elements.call(
        d3.drag()
            .on("start", (e, d) => { if (!e.active) ForceSimulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on("drag",  (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on("end",   (e, d) => { if (!e.active) ForceSimulation.alphaTarget(0); d.fx = null; d.fy = null; })
    );

    // ── Force simulation ─────────────────────────────────────────────────────
    const ForceSimulation = d3.forceSimulation(data.nodes)
        .force("link",    d3.forceLink(data.links).id(d => d.id).distance(35))
        .force("charge",  d3.forceManyBody().strength(-120))
        .force("center",  d3.forceCenter(width / 2, height / 2))
        .force("x",       d3.forceX(width / 2).strength(0.08))
        .force("y",       d3.forceY(height / 2).strength(0.08))
        .force("collide", d3.forceCollide().radius(d => scale_radius(d.degree) + 4))
        .on("tick", ticked);

    // ── Tick: update positions + clamp to bounds ─────────────────────────────
    function ticked() {
        node_elements.attr("transform", d => {
            const r = scale_radius(d.degree);
            d.x = Math.max(r, Math.min(width  - r, d.x));
            d.y = Math.max(r, Math.min(height - r, d.y));
            return `translate(${d.x},${d.y})`;
        });

        link_elements
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
    }

    // ── Zoom and pan ─────────────────────────────────────────────────────────
    svg.call(
        d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.1, 10])
            .on("zoom", function({ transform }) {
                main_group.attr("transform", transform);
            })
    );
}
