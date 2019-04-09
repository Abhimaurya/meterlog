const fs = require('fs');
const paths = process.argv.length > 2 ? process.argv.slice(2) : [];
if(paths.length>0){
	//define a result hashmap
	const disconnectionMap = {

	}

	paths.forEach((file)=>{
		// read csv and convert it to array
		const content = fs.readFileSync(file,{encoding:'utf8'})
		.toString() // convert Buffer to string
	    .split('\n') // split string to lines
	    .map(e => e.trim()) // remove white spaces for each line
	    .map(e => e.split(',').map(e => e.trim())); // split e;
	    content.shift();
	    let meterId = '';
	    let currentDate = null;

	    //Iterate through each row in csv or in array after csv to array conversion
	    content.forEach((n)=>{
	    	//for every new meter, reset meterId and currentDate and continue loop
	    	if(meterId !== n[1]){
	    		meterId = n[1];
	    		const time = n[2].split(/[\s:-]+/);
	    		currentDate = new Date(time[2],time[1],time[0]);
	    		return;
	    	}

	    	//For each row, check for number of days between last date and current date
	    	const time = n[2].split(/[\s:-]+/);
	    	const oldDate = currentDate;
	    	const newDate = new Date(time[2],time[1],time[0]);
	    	const daysBetween = Math.floor((Math.abs(newDate - currentDate) / 36e5)/24) - 1;


	    	//If number of days between last date and current date is more than 1, then log intermedtiate days
	    	if(daysBetween >=1){
	    		let days = [];

	    		//start with the next day from old date 
	    		let startDay = oldDate.setDate(oldDate.getDate()+1);

	    		// keep pushing days for the number of days between
	    		for(let i=0; i < daysBetween; i++){
	    			days.push(new Date(startDay));
	    			startDay = new Date(startDay);
	    			startDay = startDay.setDate(startDay.getDate()+1);
	    		}

	    		//convert days array into DD-MM format
	    		days = days.map(n=>(n.getDate()+'-'+n.getMonth()));

	    		//Push the days array into the result map
	    		if(disconnectionMap[meterId]){
	    			disconnectionMap[meterId] = disconnectionMap[meterId].concat(days);
	    		}
	    		else{
	    			disconnectionMap[meterId] = days;
	    		}

	    	}

	    	//set current date as new date
	    	currentDate = newDate;
	    })
	    
	})

	//write the result into result.json file 
    fs.writeFile('result.json', JSON.stringify(disconnectionMap), function (err) {
	  if (err) throw err;
	  console.log('Saved!');
	});
}
else{
	console.log('Please provide folder paths');
	console.log( "npm start '/Users/Document/file1.csv' '/Users/Document/file2.csv'");
}