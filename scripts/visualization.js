// Load your CSV data
d3.csv("Global Missing Migrants Dataset.csv").then((data) => {
	
	
	//Render Stacked Bar Chart
	let stackedBarChart = new StackedBarChart(data);
	stackedBarChart.draw();

	//Render Pie Chart
	let pieChart = new PieChart(data, null);
	pieChart.draw();

	//Render Map
	renderProportionalSymbolMap(data, stackedBarChart, pieChart);

	//Render Sanke Chart
	renderSankeyChart(data);

	return;
})