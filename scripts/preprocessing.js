function processData(data) {
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

		//Incidents without defined Coordinates are excluded
		const coordinates = row['Coordinates'].split(',').map(value => Number(value.trim()));
		if(coordinates.length < 2 || isNaN(coordinates[0]) || isNaN(coordinates[1]))
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

	return;
	
}