function renderSankeyChart(csvData, stackedBarChart=null, pieChart=null) {

    const width = 400;
    const height = 400;

    const data = processDataForSankeyChart(csvData);

    // Set up the SVG container
    const svg = d3.select('#sankey-chart')
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
    
	// Define a color scale for links
	const linkColor = d3.scaleOrdinal(d3.schemeCategory10);
	
    // Draw links
    const link = svg.append("g")
		.selectAll(".link")
        .data(data.links)
        .enter()
		.append("path")
        .attr("class", "link")
        .attr("d", sankey.link())
        .attr("stroke", (d, i) => linkColor(i))
		.attr("stroke-opacity", 0.4)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
		.sort(function(a,b) { return b.dy - a.dy})
		.attr("fill", "none")
		.on("mouseover", function(d) {
			// Add your mouseover logic for links here
			// You can access the data of the link using 'd'
			d3.select(this)
				.transition()
				.duration(200)
				.attr("stroke", "black")
				.attr("stroke-width", 2);
		})

		.on("mouseout", function(d) {
			// Add your mouseout logic for links here
			d3.select(this)
				.transition()
				.duration(200)
				.attr("stroke", (d, i) => linkColor(i))
				.attr("stroke-width", function(d) { return Math.max(1, d.dy); });
		});

	// Define a color scale for nodes
    const nodeColor = d3.scaleOrdinal(d3.schemeCategory10);
		
    // Draw nodes
    const node = svg.append("g")
		.selectAll(".node")
        .data(data.nodes)
        .enter().append("g")
        .attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      	// .call(d3.drag()
        // .subject(function(d) { return d; })
        .on("start", function() { this.parentNode.appendChild(this); })
        // .on("drag", dragmove))
        .attr("fill", (d, i) => nodeColor(i))
		.on("mouseover", function(d) {
			// Add your mouseover logic for nodes here
			// You can access the data of the node using 'd'
		
		})
		.on("mouseout", function(d) {
			// Add your mouseout logic for nodes here
			
		});
		
	node
		.append("rect")
		  .attr("height", function(d) { return d.dy; })
		  .attr("width", sankey.nodeWidth())
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
			.style("font-size", "12px")
			.style("fill", "black")
			.style("font-weight", "bold")
			.text(function(d) { if(d.value) return d.name; return null;})
			.filter(function(d) { return d.x < width / 2; })
			.attr("x", 6 + sankey.nodeWidth())
			.attr("text-anchor", "start");

	// Add a title at the bottom
	svg.append("text")
	   .attr("x", width /2 )
       .attr("y", 70)  // Adjust the position as needed
       .attr("text-anchor", "middle")
       .style("font-size", "16px")
       .style("font-weight", "bold")
       .text("Sankey Chart for Migration Movements");
			
	svg.append("text")
            .attr("class", "left-label")
            .attr("x", 0)
            .attr("y", 85)
            .attr("dy", "0.35em")
            .attr("text-anchor", "start")
            .text("Origin Region");

			
	svg.append("text")
            .attr("class", "right-label")
            .attr("x", width - 100)
            .attr("y", 85)
            .attr("dy", "0.35em")
            .attr("text-anchor", "start")
            .text("Incident Region");
}