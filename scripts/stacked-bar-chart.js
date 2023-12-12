class StackedBarChart {
	constructor(csvData, region) {
		this.stackedBarChartData = processDataForStackedBarChart(csvData, region);
		this.years = this.stackedBarChartData.map(entry => entry.year);
		this.categories = Object.keys(this.stackedBarChartData[0]).filter(key => key !== 'year');
		this.width = 500;
		this.height = 400;
		this.svg = d3.select("#stacked-bar-chart")
			.attr("width", this.width)
			.attr("height", this.height);

		this.legendSvg = d3.select("#bar-chart-legend");

		this.margin = {top: 20, right: 0, bottom: 50, left: 50};
		
		this.innerWidth = this.width - this.margin.left - this.margin.right;
		this.innerHeight = this.height - this.margin.top - this.margin.bottom;
		this.x = d3.scaleBand()
			.range([0, this.innerWidth])
			.padding(0.1)
			.domain(this.years.map(String));

		this.y = d3.scaleLinear()
			.range([this.innerHeight, 0])
			.domain([0, d3.max(this.stackedBarChartData, d => d3.sum(this.categories, c => d[c]))]);
		
		this.colorForCategory = {
			"Mixed or unknown": "#ff7f0e",	//Orange
			"Violence": "#d62728",	//Red
			"Harsh environmental conditions / lack of adequate shelter, food, water": "#8c564b",	//Brown
			"Drowning": "#1f77b4",	//Blue
			"Vehicle accident / death linked to hazardous transport": "#e377c2",	//Pink
			"Sickness / lack of access to adequate healthcare": "#9467bd",	//Purple
			"Accidental death": "#bcbd22",	//Yellow
			"Drowning,Mixed or unknown": "#17becf"	//cyan
		};

		// Define a variable to store the currently hovered bar
		this.hoveredBar = null;

		this.stack = d3.stack()
			.keys(this.categories);

		this.stackedData = this.stack(this.stackedBarChartData);

		this.g = this.svg.append("g")
			.attr("transform", `translate(${this.margin.left},${this.margin.top})`);

		this.title = region ? `Fatalities in ${region} over the years` : "Fatalities over the years";
	}

	draw() {
        const chart = this;

		this.g.selectAll("g")
			.data(this.stackedData)
			.enter().append("g")
			.attr("fill", d => this.colorForCategory[d.key])
			.selectAll("rect")
			.data(d => d)
			.enter().append("rect")
			.attr("x", d => chart.x(d.data.year))
			.attr("y", d => chart.innerHeight)
			.attr("height", 0)  // Set initial height to 0
            .attr("width", chart.x.bandwidth())
			.transition()
			.duration(1000)
			.attr("y", d => chart.y(d[1]))
			.attr("height", d => { return chart.y(d[0]) - chart.y(d[1]) || 0;});
		
		const legend = this.legendSvg.append("g")
            .attr("class", "legend");

		const legendItems = legend.selectAll(".legend-item")
            .data(this.categories)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(150, ${i * 15})`); // Adjust spacing as needed

        legendItems.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d => this.colorForCategory[d]);

        legendItems.append("text")
            .attr("x", 15)
            .attr("y", 4)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d);

		this.g.append("g")
			.attr("transform", `translate(0,${this.innerHeight})`)
			.call(d3.axisBottom(this.x));

		this.g.append("g")
			.call(d3.axisLeft(this.y))
			.append("text")
			.attr("fill", "#000")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("font-size", "15px")
			.attr("dy", "0.71em")
			.attr("text-anchor", "end")
			.text("Fatalities");

		this.svg.append("text")
			.attr("transform", `translate(${this.width / 2},${this.height - this.margin.bottom + 30})`)
			.style("text-anchor", "middle")
			.text("Year");

		this.svg.append("text")
			.attr("transform", "rotate(-90)")
			.style("text-anchor", "middle")
			.text("Fatalities");

		this.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", this.width / 2)
            .attr("y", this.height - 5 )
            .attr("text-anchor", "middle")
            .style("font-size", "16px") 
            .text(this.title);
	}

	clear() {
		this.g.selectAll("g").remove(); // Clear previous chart elements
		this.svg.selectAll("text").remove();
		this.legendSvg.select(".legend").remove();
	}
}