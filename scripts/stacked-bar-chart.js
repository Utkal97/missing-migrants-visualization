class StackedBarChart {
	constructor(csvData, region) {
		this.stackedBarChartData = processDataForStackedBarChart(csvData, region);
		this.years = this.stackedBarChartData.map(entry => entry.year);
		this.categories = Object.keys(this.stackedBarChartData[0]).filter(key => key !== 'year');
		this.width = 800;
		this.height = 400;
		this.svg = d3.select("#stacked-bar-chart")
			.attr("width", this.width)
			.attr("height", this.height);

		this.margin = {top: 20, right: 20, bottom: 30, left: 40};
		
		this.innerWidth = this.width - this.margin.left - this.margin.right;
		this.innerHeight = this.height - this.margin.top - this.margin.bottom;
		this.x = d3.scaleBand()
			.range([0, this.innerWidth])
			.padding(0.1)
			.domain(this.years.map(String));

		this.y = d3.scaleLinear()
			.range([this.innerHeight, 0])
			.domain([0, d3.max(this.stackedBarChartData, d => d3.sum(this.categories, c => d[c]))]);

	this.color = d3.scaleOrdinal()
		.range(d3.schemeCategory10);

	this.stack = d3.stack()
		.keys(this.categories);

	this.stackedData = this.stack(this.stackedBarChartData);

	this.g = this.svg.append("g")
		.attr("transform", `translate(${this.margin.left},${this.margin.top})`);
	}

	draw() {

		this.g.selectAll("g")
			.data(this.stackedData)
			.enter().append("g")
			.attr("fill", d => this.color(d.key))
			.selectAll("rect")
			.data(d => d)
			.enter().append("rect")
			.attr("x", d => this.x(d.data.year))
			.attr("y", d => this.y(d[1]))
			.attr("height", d => this.y(d[0]) - this.y(d[1]))
			.attr("width", this.x.bandwidth());

		this.g.append("g")
			.attr("transform", `translate(0,${this.innerHeight})`)
			.call(d3.axisBottom(this.x));

		this.g.append("g")
			.call(d3.axisLeft(this.y))
			.append("text")
			.attr("fill", "#000")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.attr("text-anchor", "end")
			.text("Value");

		this.svg.append("text")
			.attr("transform", `translate(${this.width / 2},${this.height - this.margin.bottom + 30})`)
			.style("text-anchor", "middle")
			.text("Year");
	}

	clear() {
		this.g.selectAll("g").remove(); // Clear previous chart elements
	}
}