// Set up the map container
const width = window.innerWidth;
const height = window.innerHeight;

// Load your CSV data
d3.csv("Global Missing Migrants Dataset.csv").then((data) => {

	//Pre-process the dataset
	const processedData = processData(data);

	//Render Map
	renderWorldMap(processedData);
	
	//Render Sanke Chart
	renderSankeChart(processedData);

	//Render Area Chart
	renderAreaChart(processedData);

	return;
})
