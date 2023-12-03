function renderSankeyChart(csvData) {

    const width = 500;
    const height = 500;

    const data = processDataForSankeyChart(csvData);

    // Set up the SVG container
    const svg = d3.select('#sankey-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create a Sankey layout
    const sankey = d3.sankey()
        .nodeWidth(5)
        .nodePadding(5)
        .size([width, height]);
	
	sankey
		.nodes(data.nodes)
		.links(data.links)
		.layout(1);

    // Draw links
    const link = svg.append("g")
		.selectAll(".link")
        .data(data.links)
        .enter()
		.append("path")
        .attr("class", "link")
        .attr("d", sankey.link())
        .attr("stroke", "#000")
		.attr("stroke-opacity", 0.7)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
		.sort(function(a,b) { return b.dy - a.dy})
		.attr("fill", "none");

    // Draw nodes
    const node = svg.append("g")
		.selectAll(".node")
        .data(data.nodes)
        .enter().append("g")
        .attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      	.call(d3.drag()
        .subject(function(d) { return d; })
        .on("start", function() { this.parentNode.appendChild(this); })
        .on("drag", dragmove))
        .attr("fill", "#2196F3");
    
		
	node
		.append("rect")
		  .attr("height", function(d) { return d.dy; })
		  .attr("width", sankey.nodeWidth())
		// Add hover text
		.append("title")
		  .text(function(d) { return d.name + "\n" + "There were " + d.value + " casualities in this path"; });

	// add in the title for the nodes
    node
		.append("text")
			.attr("x", -6)
			.attr("y", function(d) { return d.dy / 2; })
			.attr("dy", ".35em")
			.attr("text-anchor", "end")
			.attr("transform", null)
			.style("font-size", "15px")
			.text(function(d) { if(d.value) return d.name; return null;})
			.filter(function(d) { return d.x < width / 2; })
			.attr("x", 6 + sankey.nodeWidth())
			.attr("text-anchor", "start");

	// the function for moving the nodes
	function dragmove(d) {
		d3.select(this)
		.attr("transform",
				"translate("
				+ d.x + ","
				+ (d.y = Math.max(
					0, Math.min(height - d.dy, d3.event.y))
					) + ")");
		sankey.relayout();
		link.attr("d", sankey.link() );
	}
}