var fileLoaded = 0;
var transactions = new Array();
window.onload = function(e){

	if (window.File && window.FileReader && window.FileList && window.Blob) {
	  // Great success! All the File APIs are supported.
	} else {
	  alert('The File APIs are not fully supported in this browser.');
	}

	var fileInput = document.getElementById('fileInput');
	var fileDisplayArea = document.getElementById('fileDisplayArea');
	/*
	$.support.cors = true;
	$.ajax({
	    type: "GET",
	    url: "https://sis.rit.edu/portalServices/exportfoodtranscsv.do?sdate=10012013&edate=01222014",
	    headers: {"Origin":"sis.rit.edu"},
	    //dataType: "json",
	    success: function(data, textStatus) {
	    	console.log(data);
	        if (data.redirect) {
	            // data.redirect contains the string URL to redirect to
	            $.ajax({
				    type: "GET",
				    url: data.redirect,
				    data: reqBody,
				    dataType: "text",
				    success: function(data, textStatus) {
				        console.log(data);
				    }
				});
	        }
	        else {
	            console.log("NOT REDIRECT");
	        }
	    }
	});
	*/
	fileInput.addEventListener('change', function(e) 
	{
		var file = fileInput.files[0];
		var reader = new FileReader();

		reader.onload = function(e) 
		{
			//fileDisplayArea.innerText = reader.result;
			var string = reader.result;
			//console.log(string);
			//console.log("---");
			var splittedLines = string.split("\n");
			splittedLines.splice(0,1);	//Removes description line
			splittedLines.splice(splittedLines.length - 1, 1);
			var total = 0;

			for(var i = 0; i < splittedLines.length; i++)
			{
				var extraSplit = splittedLines[i].split(",");
				total += parseFloat(extraSplit[1]);
				if(!(extraSplit[3] == "Online Deposits"))
				{
					transactions.push(new transaction(splittedLines[i]));
				}
			}
			console.log("Total : " + total);
			console.log("Average: " + total / splittedLines.length);

			//console.log(splittedLines[splittedLines.length]);
			fileDisplayArea.innerText = "Total Spent: $" + total.toFixed(2) + "\n" + "Average Spent per Trip: $" + (total / splittedLines.length).toFixed(2);

			//Create chart
			makeSpendGraph(transactions);
			makeDayPieGraph(transactions);
			makeLocPieGraph(transactions);
			fileLoaded = 1;
		}
		reader.readAsText(file);
	});
}
//Updates line graph should user change drop down menu
function lineChange()
{
	if(fileLoaded == 1)
	{
		makeSpendGraph(transactions);
	}
}
function transaction(line)
{
	var splitLine = line.split(",");
	this.date = splitLine[0];
	this.cost = parseFloat(splitLine[1]);
	this.totalLeft = parseFloat(splitLine[2]);
	this.loc = splitLine[3];
	this.group = splitLine[4];
}
//Takes all transactions and returns the array of days and amount spent that day
//in form [[UTCDATE, AMOUNTSPENT],...]
function convertData(transactions)
{
	//console.log("Called");
	var days = new Array();
	var parsedData = new Array();
	var lineOptions=document.getElementById("lineOptions");

	if(lineOptions.options[lineOptions.selectedIndex].text == "All")
	{
		for(var i = 0; i < transactions.length; i++)
		{
			//Check for multiple transactions in a day
			var utcDate = getUTC(transactions[i].date)
			if(days.indexOf(utcDate) == -1)
			{	
				days.push(utcDate);
				parsedData.push([utcDate, transactions[i].cost]);
				//console.log("adding: " + utcDate + "," + transactions[i].cost);
			}
			else
			{
				//console.log("else: " + transactions[i].cost);
				for(var j = 0; j < parsedData.length; j++)
				{
					if(parsedData[j][0] == utcDate)
					{
						parsedData[j][1] = transactions[i].cost + parsedData[j][1];
					}
				}
			}
		}
	}
	else if(lineOptions.options[lineOptions.selectedIndex].text == "Corner Store")
	{
		for(var i = 0; i < transactions.length; i++)
		{
			if(transactions[i].group == "Corner Store")
			{
				//Check for multiple transactions in a day
				var utcDate = getUTC(transactions[i].date)
				if(days.indexOf(utcDate) == -1)
				{	
					days.push(utcDate);
					parsedData.push([utcDate, transactions[i].cost]);
					//console.log("adding: " + utcDate + "," + transactions[i].cost);
				}
				else
				{
					//console.log("else: " + transactions[i].cost);
					for(var j = 0; j < parsedData.length; j++)
					{
						if(parsedData[j][0] == utcDate)
						{
							parsedData[j][1] = transactions[i].cost + parsedData[j][1];
						}
					}
				}
			}
		}
	}
	else if (lineOptions.options[lineOptions.selectedIndex].text == "Nathan's")
	{
		for(var i = 0; i < transactions.length; i++)
		{
			if(transactions[i].group == "Nathan's Soup")
			{
				//Check for multiple transactions in a day
				var utcDate = getUTC(transactions[i].date)
				if(days.indexOf(utcDate) == -1)
				{	
					days.push(utcDate);
					parsedData.push([utcDate, transactions[i].cost]);
					//console.log("adding: " + utcDate + "," + transactions[i].cost);
				}
				else
				{
					//console.log("else: " + transactions[i].cost);
					for(var j = 0; j < parsedData.length; j++)
					{
						if(parsedData[j][0] == utcDate)
						{
							parsedData[j][1] = transactions[i].cost + parsedData[j][1];
						}
					}
				}
			}
		}
	}
	else if (lineOptions.options[lineOptions.selectedIndex].text == "Commons")
	{
		for(var i = 0; i < transactions.length; i++)
		{
			if(transactions[i].group == "Dining Commons")
			{
				//Check for multiple transactions in a day
				var utcDate = getUTC(transactions[i].date)
				if(days.indexOf(utcDate) == -1)
				{	
					days.push(utcDate);
					parsedData.push([utcDate, transactions[i].cost]);
					//console.log("adding: " + utcDate + "," + transactions[i].cost);
				}
				else
				{
					//console.log("else: " + transactions[i].cost);
					for(var j = 0; j < parsedData.length; j++)
					{
						if(parsedData[j][0] == utcDate)
						{
							parsedData[j][1] = transactions[i].cost + parsedData[j][1];
						}
					}
				}
			}
		}
	}
	else if (lineOptions.options[lineOptions.selectedIndex].text == "Vending Machines")
	{
		for(var i = 0; i < transactions.length; i++)
		{
			if(transactions[i].group == "Vending")
			{
				//Check for multiple transactions in a day
				var utcDate = getUTC(transactions[i].date)
				if(days.indexOf(utcDate) == -1)
				{	
					days.push(utcDate);
					parsedData.push([utcDate, transactions[i].cost]);
					//console.log("adding: " + utcDate + "," + transactions[i].cost);
				}
				else
				{
					//console.log("else: " + transactions[i].cost);
					for(var j = 0; j < parsedData.length; j++)
					{
						if(parsedData[j][0] == utcDate)
						{
							parsedData[j][1] = transactions[i].cost + parsedData[j][1];
						}
					}
				}
			}
		}
	}
	else
	{
		console.log("You in trouble");
		console.log(lineOptions.options[lineOptions.selectedIndex].text);
	}
	return parsedData;
}
//Takes raw date and returns string of day of week
function getDayOfWeek(rawDate)
{
	var date = new Date(getUTC(rawDate));
	var day = date.getUTCDay();
	switch(day)
	{
		case 0: return "Sunday";
		case 1: return "Monday";
		case 2: return "Tuesday";
		case 3: return "Wednesday";
		case 4: return "Thursday";
		case 5: return "Friday";
		case 6: return "Saturday";
	}
}
//Takes the raw date and returns the UTC date
function getUTC(rawDate)
{
	var splitSlash = rawDate.split("/");
	var month = parseInt(splitSlash[0]) - 1;
	var day = parseInt(splitSlash[1]);

	var splitSpace = splitSlash[2].split(" ");
	var year = parseInt(splitSpace[0]);
	return Date.UTC(year, month, day);
}

function makeSpendGraph(transactions)
{
	var newData = convertData(transactions);
    $('#container').highcharts({
       
        title: {
            text: 'Amount Spent by Day'
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                month: '%e. %b',
                year: '%b'
            }
        },
        yAxis: {
            title: {
                text: 'Dollars Spent ($)'
            },
            min: 0
        },
        tooltip: {
        	pointFormat: '{series.name}: <b>${point.y:.2f}</b><br/>'
        },
        
        series: [{
            name: 'Debit Purchases',
            // Define the data points. All series have a dummy year
            // of 1970/71 in order to be compared on the same x axis. Note
            // that in JavaScript, months start at 0 for January, 1 for February etc.
            data: newData
        }]
    });
}
//Takes all transactions and returns the array of days of the week and amount spent that day
//in form [[DAY, AMOUNTSPENT],...]
function spendByDay(transactions)
{
	var days = new Array();
	var parsedData = new Array();

	for(var i = 0; i < transactions.length; i++)
	{
		//Check for multiple transactions in a day
		var utcDate = getDayOfWeek(transactions[i].date)
		if(days.indexOf(utcDate) == -1)
		{	
			days.push(utcDate);
			parsedData.push([utcDate, transactions[i].cost]);
			//console.log("adding: " + utcDate + "," + transactions[i].cost);
		}
		else
		{
			//console.log("else: " + transactions[i].cost);
			for(var j = 0; j < parsedData.length; j++)
			{
				if(parsedData[j][0] == utcDate)
				{
					parsedData[j][1] = transactions[i].cost + parsedData[j][1];
				}
			}
		}
	}

	return parsedData;
}
//Takes all transactions and returns array of locations and amount spent at that location
//in form [[LOCATION, AMOUNTSPENT],...]
function spendByLoc(transactions)
{
	var groups = new Array();
	var parsedData = new Array();
	for(var i = 0; i < transactions.length; i++)
	{
		//Check for multiple transactions in a day
		var group = transactions[i].group
		if(groups.indexOf(group) == -1)
		{	
			groups.push(group);
			parsedData.push([group, transactions[i].cost]);
			//console.log("adding: " + group + "," + transactions[i].cost);
		}
		else
		{
			//console.log("else: " + transactions[i].cost);
			for(var j = 0; j < parsedData.length; j++)
			{
				if(parsedData[j][0] == group)
				{
					parsedData[j][1] = transactions[i].cost + parsedData[j][1];
				}
			}
		}
	}
	return parsedData;
}
//Creates a pie graph charting spending by each day of week
function makeDayPieGraph(transactions)
{
	var newData = spendByDay(transactions);
	$('#pieChart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Amount spent by day of the week'
        },
        tooltip: {
    	    pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    format: '<b>{point.name}</b>: ${point.y:.2f}'
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: newData
        }]
    });
}
function makeLocPieGraph(transactions)
{
	var newData = spendByLoc(transactions);
	$('#pieChart2').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: 'Amount spent by location'
        },
        tooltip: {
    	    pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    format: '<b>{point.name}</b>: ${point.y:.2f}'
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: newData
        }]
    });
}
