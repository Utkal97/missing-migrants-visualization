// Set up the map container
const width = window.innerWidth;
const height = window.innerHeight;

// Append an SVG element to the body
const svg = d3.select("#map-container")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

// Define a projection (you can choose a different one based on your needs)
const projection = d3.geoNaturalEarth1();
const path = d3.geoPath(projection);

// Load world map data
d3.json("https://unpkg.com/world-atlas@1/world/50m.json").then((world) => {
  	// Draw the world map
  	svg.append("path")
		.datum(topojson.feature(world, world.objects.countries))
		.attr("class", "land")
		.attr("d", path);

	// Load your CSV data
	d3.csv("Global Missing Migrants Dataset.csv").then((data) => {

    // Convert coordinates from CSV to [longitude, latitude] format
    data.forEach((d) => {
		const coords = d.Coordinates.split(',').map(Number);
		if(isNaN(coords[0]) || isNaN(coords[1]))
			d.coordinates = null;
		d.coordinates = coords;
    });
    let minLat = Infinity, maxLat = -1 *Infinity, minLon, maxLon;
    const processedData = [];
    for(let row of data) {
        const coordinates = row.Coordinates.split(',').map(Number);
        if(!isNaN(coordinates[0]) && !isNaN(coordinates[1]))
            processedData.push({...row, coordinates});

            if(coordinates[0] < minLat ) {
                minLat = coordinates[0];
                minLon = coordinates[1];
            }
            if(coordinates[0] > maxLat) {
                maxLat = coordinates[0];
                maxLon = coordinates[1];
            }
    }

    console.log({minLat, minLon, maxLat, maxLon});
    // Plot points on the map
    svg.selectAll(".incident-point")
		.data(processedData)
		.enter().append("circle")
		.attr("class", "incident-point")
		.attr("cx", (row) => projection(row.coordinates)[0])
		.attr("cy", (row) => projection(row.coordinates)[1])
		.attr("r", 5) // Adjust the radius as needed
		.style("fill", "red") // Customize the point color
		.style("opacity", 0.8) // Adjust the opacity as needed
		.on("click", (row, index) => {
			// Handle click event
			console.log(row.coordinates);
			// Add more fields as needed
		})
		.append("title")
		.text((d) => d["Incident Type"]); // Display relevant information on hover
  });
});
