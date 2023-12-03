function renderAreaChart(csvData, region = null) {

	const {data, categories} = processDataForAreaChart(csvData, region);
	
	// Set up the SVG container
	const margin = { top: 20, right: 30, bottom: 30, left: 40 };
	const width = 600 - margin.left - margin.right;
	const height = 400 - margin.top - margin.bottom;
	
	const svg = d3.select('body').append('svg')
	  	.attr('width', width + margin.left + margin.right)
	  	.attr('height', height + margin.top + margin.bottom)
	  	.append('g')
	  	.attr('transform', `translate(${margin.left},${margin.top})`);
	
	// Set up scales
	const xScale = d3.scaleTime()
	  	.domain(d3.extent(data, d => new Date(d.year, 0, 1)))
	  	.range([0, width]);
	const yScale = d3.scaleLinear()
	  	.domain([0, d3.max(data, d => d.category1 + d.category2 + d.category3)])
	  	.range([height, 0]);
	
	// Define the stack function
	const stack = d3.stack().keys(categories);
	
	// Stack the data
	const stackedData = stack(data);
	
	// Set up area generator
	const area = d3.area()
	  	.x(d => xScale(new Date(d.data.year, 0, 1)))
	  	.y0(d => yScale(d[0]))
	  	.y1(d => yScale(d[1]));
	
	// Draw the areas
	svg.selectAll('path')
	  	.data(stackedData)
	  	.join('path')
	  	.attr('class', d => `area ${d.key}`)
	  	.attr('fill', d => getColor(d.key)) // Implement getColor function as needed
	  	.attr('d', area);
	
	// Add axes
	svg.append('g')
	  	.attr('transform', `translate(0,${height})`)
	  	.call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat('%Y')));
	
	svg.append('g')
	  	.call(d3.axisLeft(yScale));
	console.log(categories)
	// Helper function to get color based on category
	function getColor(category) {
	  	const colorScale = d3.scaleOrdinal().domain(categories).range([
			'#FF5733', '#33FF57', '#5733FF', '#EEEEEE', '#DDDDDD',
			"#073137", "#000000", "#F1F8F9", "#3F6F7B", "#46818C",
			"#472F3B", "#ADBA44", "#808686", "#84A23C", "#F6F4F4"
		]);
	  	return colorScale(category);
	}
}