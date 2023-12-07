class PieChart {

        constructor(csvdata, filter) {
    
            this.data = processDataForPieChart(csvdata, filter);
            this.width = 400;
            this.height = 400;
            this.radius = Math.min(this.width, this.height) / 2;
        
            this.color = d3.scaleOrdinal().range(['#ff5733', '#ffa833', '#33ff57', '#335eff', '#a833ff']);
    
            // Define a variable to store the currently hovered slice
            this.hoveredSlice = null;
        
            this.svg = d3.select("#pie-chart")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .append("g")
                    .attr("transform", `translate(${this.width / 2},${this.height / 2})`);
        
            this.pie = d3.pie().value(d => d.fatalityCount);
        
            this.arc = d3.arc()
                        .innerRadius(0)
                        .outerRadius(this.radius)
                        .cornerRadius(8); // Add corner radius for a better look;
        }
    
        draw() {
    
            const chart = this;
    
            const arcs = this.svg.selectAll("arc")
                    .data(this.pie(this.data))
                    .enter()
                    .append("g")
                    .attr("class", "arc")
                    .on("mouseover", function (event, d) {
                            // Highlight the current slice on mouseover
                            d3.select(this)
                            .transition()
                            .duration(200) // Adjust the duration as needed
                            .attr("stroke", "black")
                            .attr("stroke-width", 2);
            
                    })
                    .on("mouseout", function (event, d) {
                        // Remove the highlight on mouseout
                        d3.select(this)
                          .transition()
                          .duration(200) // Adjust the duration as needed
                          .attr("stroke", "none");
    
                    });
    
            arcs.append("path")
                    .attr("fill", (d, i) => chart.color(i))
                    .attr("d", chart.arc);
    
            arcs.append("text")
                    .attr("transform", d => `translate(${chart.arc.centroid(d)})`)
                    .attr("text-anchor", d => (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start")
                    .text(d => `${d.data.gender}: ${Math.round(d.data.fatalityCount)}`)
                    .attr("fill", "white");
        };
    
        clear() {
            this.svg.selectAll(".arc").remove();
        };
    }