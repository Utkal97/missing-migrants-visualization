class PieChart {

    constructor(csvdata, filter) {

        this.data = processDataForPieChart(csvdata, filter);
        this.width = 400;
        this.height = 400;
        this.radius = Math.min(this.width, this.height) / 2;
    
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
    
        this.svg = d3.select("#pie-chart")
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g")
                .attr("transform", `translate(${this.width / 2},${this.height / 2})`);
    
        this.pie = d3.pie().value(d => d.fatalityCount);
    
        this.arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(this.radius);
    }

    draw() {
        const arcs = this.svg.selectAll("arc")
                .data(this.pie(this.data))
                .enter()
                .append("g")
                .attr("class", "arc");

        arcs.append("path")
                .attr("fill", (d, i) => this.color(i))
                .attr("d", this.arc);

        arcs.append("text")
                .attr("transform", d => `translate(${this.arc.centroid(d)})`)
                .attr("text-anchor", d => (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start")
                .text(d => `${d.data.gender}: ${Math.round(d.data.fatalityCount)}`)
                .attr("fill", "white");
    };

    clear() {
        this.svg.selectAll(".arc").remove();
    };
}