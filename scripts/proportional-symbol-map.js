/**
 * Renders a Proportional Symbol Map with given CSV data. A Circle 
 * @param {Object[]} csvData 
 * @returns 
 */
function renderProportionalSymbolMap(csvData, stackedBarChart, pieChart) {

	//Pre-process the dataset
	const regionData = processDataForProportionalSymbolMap(csvData);

    // Set up the map container
    const width = 800 ;
    const height = 500 ;

    const svg = d3.select('#proportional-symbol-map')
        .attr('width', width)
        .attr('height', height);

    // Define projection
    const projection = d3.geoMercator();
    // Create path generator
    const path = d3.geoPath(projection);
    let filterApplied = false;
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
                svg.selectAll('.region-text').remove();
                
                stackedBarChart.clear();
                pieChart.clear();
                filterApplied = !filterApplied
                if(filterApplied) {
                    stackedBarChart = new StackedBarChart(csvData, region.region);
                    stackedBarChart.draw();
                    pieChart = new PieChart(csvData, {region: region.region})
                    pieChart.draw();

                    svg.append('text')
                    .attr('class', 'region-text')
                    .attr('x', width / 2)
                    .attr('y', height - 20)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '30px')
                    .text(`${region.region} region with ${region.fatalityCount} fatalities over the years`);
                } else {
                    stackedBarChart = new StackedBarChart(csvData);
                    stackedBarChart.draw();
                    pieChart = new PieChart(csvData);
                    pieChart.draw();
                }

                
            })
            .on('mouseover', region => {
                
                // stackedBarChart.clear();
                // pieChart.clear();
                // stackedBarChart = new StackedBarChart(csvData, region.region);
                // stackedBarChart.draw();
                // pieChart = new PieChart(csvData, {region: region.region})
                // pieChart.draw()
            })
            .on('mouseout', region => {
                // stackedBarChart.clear();
                // pieChart.clear();
                // stackedBarChart = new StackedBarChart(csvData);
                // stackedBarChart.draw();
                // pieChart = new PieChart(csvData)
                // pieChart.draw()
            })
            .attr('opacity', 0.8);
    });

    return;
}