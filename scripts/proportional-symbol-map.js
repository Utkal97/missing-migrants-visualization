/**
 * Renders a Proportional Symbol Map with given CSV data. A Circle 
 * @param {Object[]} csvData 
 * @returns 
 */
function renderProportionalSymbolMap(csvData, stackedBarChart, pieChart) {

	//Pre-process the dataset
	const regionData = processDataForProportionalSymbolMap(csvData);

    // Set up the map container
    const width = window.innerWidth * 0.55;
    const height = window.innerHeight * 0.7;

    const svg = d3.select('#proportional-symbol-map')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Define projection
    const projection = d3.geoMercator();
    // Create path generator
    const path = d3.geoPath(projection);

    d3.json('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json').then(data => {

        svg.selectAll('path')
            .data(data.features)
            .enter().append('path')
            .attr('d', path)
            .attr('stroke', 'black')
            .attr('stroke-width', 0.5)
            .attr('fill', '#ebab34');

        // Draw circles for each coordinate
        svg.selectAll('circle')
            .data(regionData)
            .enter().append('circle')
            .attr('cx', region => projection([region.coordinates[1], region.coordinates[0]])[0])
            .attr('cy', region => projection([region.coordinates[1], region.coordinates[0]])[1])
            .attr('r', region => {
                const radius = region.fatalityCount*0.001;
                if(radius > 5)
                    return radius;
                else
                    return region.fatalityCount*0.005;
            })
            .attr('fill', 'red')
            .on('click', region => {
                stackedBarChart.clear();
                pieChart.clear();
                stackedBarChart = new StackedBarChart(csvData, region.region);
                stackedBarChart.draw();
                pieChart = new PieChart(csvData, {region: region.region})
                pieChart.draw()
            })
            .on('mouseover', region => {
                stackedBarChart.clear();
                pieChart.clear();
                stackedBarChart = new StackedBarChart(csvData, region.region);
                stackedBarChart.draw();
                pieChart = new PieChart(csvData, {region: region.region})
                pieChart.draw()
            })
            .on('mouseout', region => {
                stackedBarChart.clear();
                pieChart.clear();
                stackedBarChart = new StackedBarChart(csvData);
                stackedBarChart.draw();
                pieChart = new PieChart(csvData)
                pieChart.draw()
            })
            .attr('opacity', 0.8);
    });

    return;
}