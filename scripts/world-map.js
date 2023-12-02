function renderWorldMap(data) {

    // Append an SVG element to the body
    const svg = d3.select("#map-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    // Load world map data
	
    // Define a projection (you can choose a different one based on your needs)
    const projection = d3.geoNaturalEarth1();
    const path = d3.geoPath(projection);

    d3.json("https://unpkg.com/world-atlas@1/world/110m.json").then((world) => {
        
        // Draw the world map
		svg.append("path")
		.datum(topojson.feature(world, world.objects.countries))
		.attr("class", "land")
		.attr("d", path);
		

	})
}