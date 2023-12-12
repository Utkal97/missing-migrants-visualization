/**
 * Renders a Proportional Symbol Map with given CSV data. A Circle 
 * @param {Object[]} csvData 
 * @returns 
 */
function renderProportionalSymbolMap(csvData, stackedBarChart, pieChart) {

	//Pre-process the dataset
	const regionData = processDataForProportionalSymbolMap(csvData);

    // Set up the map container
    const width = 700 ;
    const height = 400 ;

    const svg = d3.select('#proportional-symbol-map')
        .attr('width', width)
        .attr('height', height);

    // Define projection
    const projection = d3.geoMercator();
    // Create path generator
    const path = d3.geoPath(projection);
    let filterApplied = false, selectedRegion = null;
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
            .attr('r', region => computeRadius(region))
            .attr('fill', 'red')
            .on('click', function (region) {

                d3.select('#region-text-container').selectAll('.region-text').remove();


                stackedBarChart.clear();
                pieChart.clear();
                filterApplied = !filterApplied;

                if(filterApplied) {

                   
                    selectedRegion = region;
                    stackedBarChart = new StackedBarChart(csvData, selectedRegion.region);
                    stackedBarChart.draw();
                    pieChart = new PieChart(csvData, {region: selectedRegion.region})
                    pieChart.draw();

                    d3.select('#region-text-container')
                        .append('p')
                        .attr('y', height - 20)
                        .attr('class', 'region-text')
                        .text(`${selectedRegion.region} region with ${selectedRegion.fatalityCount} fatalities over the years`);

                    d3.select(this)
                        .attr('stroke', 'white')
                        .attr('stroke-width', 2)
                        .attr('r', computeRadius(region))
                        .transition()
                        .duration(1000)
                        .attr('r', computeRadius(region) * 1.5);
                } else {

                    selectedRegion = null;
                    stackedBarChart = new StackedBarChart(csvData);
                    stackedBarChart.draw();
                    pieChart = new PieChart(csvData);
                    pieChart.draw();

                    d3.selectAll('circle')
                        .attr('stroke', 'none')
                        .attr('r', function(d) { return d3.select(this).attr('r'); })
                        .transition()
                        .duration(1000)
                        .attr('r', d => computeRadius(d));
                }
            })
            .on('mouseover', function(region) {
                
                d3.select('#region-text-container').selectAll('.region-text').remove();
                d3.select('#region-text-container')
                    .append('p')
                    .attr('y', height - 20)
                    .attr('class', 'region-text')
                    .text(`${region.region} region with ${region.fatalityCount} fatalities over the years`);
        
                d3.select(this)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 2);
            })
            .on('mouseout', function(region)  {
                if(!selectedRegion || !selectedRegion == this.region)
                    d3.select(this)
                        .attr('stroke', 'none');
            })
            .attr('opacity', 0.8);
    });

    const computeRadius = (region) => {
        const radius = region.fatalityCount*0.001;
        if(radius > 5)
            return radius;
        else
            return region.fatalityCount*0.005;
    }
    return;
}