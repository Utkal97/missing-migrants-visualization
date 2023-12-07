

//Incidents without defined Coordinates are excluded
const extractValidCoordinates = (row) => {

	const coordinates = row['Coordinates']?.split(',')?.map(value => Number(value.trim()));
	if(coordinates.length < 2 || isNaN(coordinates[0]) || isNaN(coordinates[1]))
		return null;

	return coordinates;
}

/**
 * Processes the given CSV data and applies filter to get the required records to be shown on Proportional Symbol Map
 * @param {Object[]} data - CSV File data that contains data of missing migrants
 */
function processDataForProportionalSymbolMap(data) {
	if(!data.length)
		return [];

	/*
		processedData is a dictionary containing the information categorized by each Region.
		i.e., {
			regionName: List of Incident Records in that region
		}
	*/

	const processedData = {};

	for(const row of data) {
		const region = row['Region of Incident'];

		if(!processedData[region]) {
			processedData[region] = [];
		}

		const coordinates = extractValidCoordinates(row);

		//Incidents without defined Coordinates are excluded
		if(!coordinates)
			continue;

		const incident = {};

		for(const field in row) {
			if(field == 'Region of Incident' || field == 'Coordinates')
				continue;

			incident[field] = row[field];
		}

		incident.coordinates = coordinates;
		processedData[region].push(incident);
	}

	const regionData = [];

	for(const region in processedData) {

        if(!processedData[region].length) 
            continue;

        const center = [0.0, 0.0];
        fatalityCount = 0;

        for(const incident of processedData[region]) {

            center[0] += incident.coordinates[0];
            center[1] += incident.coordinates[1];

            if(!isNaN(incident['Total Number of Dead and Missing']))
                fatalityCount += Number(incident['Total Number of Dead and Missing']);
        }

        center[0] /= processedData[region].length;
        center[1] /= processedData[region].length;

        regionData.push({
            coordinates: [center[0], center[1]],
            region,
            fatalityCount
        });
    }
	return regionData;
}

/**
 * Processes the given CSV data and applies filter to get the required records to be shown on Sankey Chart
 * @param {Object[]} data - CSV File data that contains data of missing migrants
 * @param {string} region - Region to be filtered
 */
function processDataForSankeyChart(data) {

	if(!data.length)
		return [];

	const sourceIdOfRegion = {}, targetIdOfRegion = {}, linksMap = {}, nodes = [], idToName = {};
	let id = 1;

	for(const row of data) {
		
		const source = row['Region of Origin'], target = row['Region of Incident'], 
			fatalityCount = row['Total Number of Dead and Missing'];
		
		if( !extractValidCoordinates(row) || 
			(!source || source=="Unknown" || source=="") ||
			(!target || target=="Unknown" || target=="") ||
			isNaN(fatalityCount) || source == target)
			continue;

		else if(sourceIdOfRegion[source])
			continue;

		sourceIdOfRegion[source] = id;
		nodes.push({
			name: source,
			node: id,
			type: "Src"
		});
		idToName[id] = source;
		id++;
	}

	for(const row of data) {

		const source = row['Region of Origin'], target = row['Region of Incident'], 
			fatalityCount = row['Total Number of Dead and Missing'];
		
		if( !extractValidCoordinates(row) || 
			(!source || source=="Unknown" || source=="") ||
			(!target || target=="Unknown" || target=="") ||
			isNaN(fatalityCount) || source == target)
			continue;

		else if(targetIdOfRegion[target])
			continue;

		targetIdOfRegion[target] = id;
		nodes.push({
			name: target,
			node: id,
			type: "Tgt"
		});
		idToName[id] = target;
		id++;
	}

	for(const row of data) {
		const source = row['Region of Origin'], target = row['Region of Incident'], 
			fatalityCount = row['Total Number of Dead and Missing'];
		
		if( !extractValidCoordinates(row) || 
			(!source || source=="Unknown" || source=="") ||
			(!target || target=="Unknown" || target=="") ||
			isNaN(fatalityCount) || source == target)
			continue;
		
		const link = `${sourceIdOfRegion[source]}_${targetIdOfRegion[target]}`;
		if(!linksMap[link])
				linksMap[link] = Number(fatalityCount);
			else
				linksMap[link] += Number(fatalityCount);
	}
	
	const links = [];

	for(const link in linksMap) {
		const [source, target] = link.split('_');

		if(isNaN(source) || isNaN(target) || source==target)
			continue;

		links.push({
			source: Number(source)-1, 
			target: Number(target)-1, 
			value: linksMap[link]
		});
	}

	function compare( a, b ) {
		return a.value < b.value ? 1 : -1;
	}

	const biggestLinks = links.sort( compare ).slice(0,20);

	return {nodes: nodes, links: biggestLinks};
}

/**
 * Processes the given CSV data and applies filter to get the required records to be shown on Stacked Bar Chart
 * @param {Object[]} data - CSV File data that contains data of missing migrants
 * @param {string} region - (optional) If provided, the result data will only contain incidents of that region
 */
function processDataForStackedBarChart(data, region) {
	if(!data.length)
		return [];

	// Sample data with only years
	// const data = [
	// 	{ year: 2021, category1: 10, category2: 20, category3: 15 },
	// 	{ year: 2022, category1: 15, category2: 25, category3: 20 },
	// 	{ year: 2023, category1: 9, category2: 30, category3: 18}]
	let filteredData = [];

	if(region)
		for(const row of data) {
			if(row["Region of Incident"] == region)
				filteredData.push(row);
		}
	else
		filteredData = data;
	const fatalities = {}, causes = new Set();
	for(const row of filteredData) {
		const year = row['Incident year'],
			causeOfDeath = row['Cause of Death'],
			count = !isNaN(row['Total Number of Dead and Missing']) ? 
				Number(row['Total Number of Dead and Missing']) : 0;

		if(!year && !extractValidCoordinates(row))
			continue;

		if(!fatalities[year]) 
			fatalities[year] = {};
		if(!fatalities[year][causeOfDeath])
			fatalities[year][causeOfDeath] = 0;

		fatalities[year][causeOfDeath]+= count;
		causes.add(causeOfDeath);
	}

	const processedData = [];
	for(const year in fatalities) {
		processedData.push({
			year: Number(year),
			...fatalities[year]
		});
	}

	return processedData;
}

/**
 * Processes the given CSV data and applies filter to get the required records to be shown on Pie Chart
 * @param {Object[]} data - CSV File data that contains data of missing migrants
 * @param {Object} filter - A filtering object that contains queries for filtering
 */
function processDataForPieChart(data, filter = null) {
	if(!data.length)
		return [];

	// Sample Output Data
	// const data = [
	//	{gender: Male, percent: 50},
	//	{gender: Female, percent: 30},
	//	{gender: Child, percent: 20}	
	// ]
	
	let filteredData = [];

	for(const incident of data) {
		const region = filter && filter.region ? filter.region : null,
			causeOfDeath = filter && filter.causeOfDeath ? filter.causeOfDeath : null,
			year = filter && filter.year ? filter.year : null;

		if(!extractValidCoordinates(incident))
			continue;
		if(region && incident["Region of Incident"] != region)
			continue;
		if(causeOfDeath && incident["Cause of Death"] != causeOfDeath)
			continue;
		if(year && incident["Year"] != year)
			continue;
		
		filteredData.push(incident);
	}

	const genderData = {
		Males: 0,
		Females: 0,
		Children: 0
	};

	for(const incident of filteredData) {
		genderData.Males += !isNaN(incident["Number of Males"]) ? Number(incident["Number of Males"]) : 0;
		genderData.Females += !isNaN(incident["Number of Females"]) ? Number(incident["Number of Females"]) : 0;
		genderData.Children += !isNaN(incident["Number of Children"]) ? Number(incident["Number of Children"]) : 0;
	}

	const total = genderData.Males + genderData.Females + genderData.Children;

	return [
		{gender: "Males", fatalityCount: total > 0 ? 100*genderData["Males"]/total : 0},
		{gender: "Females", fatalityCount: total > 0 ? 100*genderData["Females"]/total : 0},
		{gender: "Children", fatalityCount: total > 0 ? 100*genderData["Children"]/total : 0}
	];
}