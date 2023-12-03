// Load your CSV data
d3.csv("Global Missing Migrants Dataset.csv").then((data) => {
	
	//Render Map
	renderProportionalSymbolMap(data);

	//Render Sanke Chart
	renderSankeyChart(data);

	//Render Area Chart
	renderAreaChart(data);

	//Render Pie Chart
	renderPieChart(data);
	return;
})
