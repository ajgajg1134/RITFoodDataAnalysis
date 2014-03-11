var fileLoaded = 0; //Boolean has file loaded
var transactions = new Array();
var file; //The csv file inputted
var reader = new FileReader();

var startUTC = 1390089600000;
var endUTC = 1400803200000;

//var startUTC = 1376265600000;
//var endUTC = 1387411200000;

window.onload = function(e){

	if (window.File && window.FileReader && window.FileList && window.Blob) {
	  // Great success! All the File APIs are supported.
	} else {
	  $("#alert").css("visibility", "visible");
	  $("#alert").css("height", "auto");
	  $("#info").css("visibility", "hidden");
	}

	
	var uploadBtn = document.getElementById('upload');
	var fileInput = document.getElementById('fileInput');
	$("#uploadSpecial").css("background-color", "#000000");

	function cancel(e) {
      if (e.preventDefault) { e.preventDefault(); }
      return false;
    }

	addEventHandler(uploadBtn, 'dragover', cancel);
    addEventHandler(uploadBtn, 'dragenter', cancel);

	uploadBtn.addEventListener('drop', dropEvent, false);

	fileInput.addEventListener('change', function(e) 
	{
		file = fileInput.files[0];
		reader.readAsText(file);
	});
	var fileDisplayArea = document.getElementById('fileDisplayArea');
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
				transactions.push(new Transaction(splittedLines[i]));
			}
		}
		//console.log("Total : " + total);
		//console.log("Average: " + total / splittedLines.length);

		//console.log(splittedLines[splittedLines.length]);
		fileDisplayArea.textContent =  "Total Remaining: $" + getFinalAmount() + "\n"  
									 + "Average Spent per Day: $" + getAvgPerDay().toFixed(2) + "\n" 
									 + "Amount you can spend per day: $" + getSpendPerDayEnd().toFixed(2) + "\n" 
									 + "Total Spent: $" + total.toFixed(2);

		//Create chart
		makeSpendGraph(transactions);
		makeDayPieGraph(transactions);
		makeLocPieGraph(transactions);
		makeBestFitGraph(transactions);
		fileLoaded = 1;
		//Here the download and upload buttons are squashed from the screen
		$("#start").css("visibility", "hidden");
		$("#start").css("height", "0px");
		$("#download").css("height", "0px");
		$("#upload").css("height", "0px");
		$("#LineGraphOptions").css( "visibility", "visible" );
	}
}
function addEventHandler(obj, evt, handler) {
    if(obj.addEventListener) {
        // W3C method
        obj.addEventListener(evt, handler, false);
    } else if(obj.attachEvent) {
        // IE method.
        obj.attachEvent('on'+evt, handler);
    } else {
        // Old school method.
        obj['on'+evt] = handler;
    }
}
function dropEvent(e)
{
	e.stopPropagation();
    e.preventDefault();

	console.log("Dropping!\n");
	reader.readAsText(e.dataTransfer.files[0]);
}
//Calculates and returns the amount the user has spent per day (NOT transaction)
function getAvgPerDay()
{
	var days = new Array();
	var parsedData = new Array();
	var lineOptions=document.getElementById("lineOptions");
	var lineValue = lineOptions.options[lineOptions.selectedIndex].value;

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
	var sum = 0;
	for (var i = 0; i < parsedData.length; i++)
	{
		sum += parsedData[i][1];
	}
	return sum / parsedData.length;
}
//Activates JQuery doge plugin
//Causes doge-isms to appear on screen
function activateDoge()
{
	$($.doge);
}
//Gets amount user can spend per day to end with $0
function getSpendPerDayEnd()
{
	var currDate = new Date().getTime();
	//console.log("Current date: " + currDate);

	var difference = endUTC - currDate;

	//Difference is the number of milliseconds between current date and end date of semester
	difference = difference / 1000;
	//Now is seconds
	difference = difference / 3600;
	//Now is hours
	difference = difference / 24;
	//Now is number of days

	return getFinalAmount() / difference;
}
//Gets last entry and returns amount of money user has left
function getFinalAmount()
{
	return transactions[transactions.length - 1].totalLeft;
}
//Updates line graph should user change drop down menu
function lineChange()
{
	if(fileLoaded == 1)
	{
		makeSpendGraph(transactions);
	}
}
function Transaction(line)
{
	var splitLine = line.split(",");
	this.date = splitLine[0];
	this.cost = parseFloat(splitLine[1]);
	this.totalLeft = parseFloat(splitLine[2]);
	this.loc = splitLine[3];
	this.group = splitLine[4];
}
function getTotalLeftData()
{
	var days = new Array();
	var parsedData = new Array();
	var lineOptions=document.getElementById("lineOptions");

	for(var i = 0; i < transactions.length; i++)
	{
		//Check for multiple transactions in a day
		var utcDate = getUTC(transactions[i].date)
		if(utcDate > startUTC && utcDate < endUTC)
		{
			if(days.indexOf(utcDate) == -1)
			{	
				days.push(utcDate);
				parsedData.push([utcDate, transactions[i].totalLeft]);
				//console.log("adding: " + utcDate + "," + transactions[i].cost);
			}
			else
			{
				//console.log("else: " + transactions[i].cost);
				for(var j = 0; j < parsedData.length; j++)
				{
					if(parsedData[j][0] == utcDate)
					{
						parsedData[j][1] = transactions[i].totalLeft;
					}
				}
			}
		}
	}
	return parsedData;
}
//Takes transactions and finds line of best fit regarding total money
function findLineBestFit(transactionsWork)
{
	var days = new Array();
	var parsedData = new Array();
	var lineOptions=document.getElementById("lineOptions");
	var n = 0;
	var sumX = 0;
	var sumY = 0;
	var sumXsquare = 0;
	var sumProduct = 0;
	for(var i = 0; i < transactionsWork.length; i++)
	{
		var utc = getUTC(transactionsWork[i].date);
		//Check if data is before start of semester
		if(utc > startUTC && utc < endUTC)
		{
			sumX += utc
			sumY += transactionsWork[i].totalLeft;
			sumProduct += utc * transactionsWork[i].totalLeft;
			sumXsquare += Math.pow(utc, 2);
			n++;
		}	
	}
	//console.log("sumx: " + sumX);
	//console.log("sumy: " + sumY);
	var slope = ((n*sumProduct) - (sumX * sumY)) / ((n*sumXsquare) - Math.pow(sumX, 2));
	var intercept = (sumY - (slope * sumX)) / n;

	//Formula for line is y = intercept + slope ( x )
	//Or: total left = intercepty + slope ( date in UTC )

	//Start date for semester: 1390089600000 (1/19/2014)
	//End date for semester: 1400803200000 (05/23/2014)

	var estimateEndAmount = intercept + (slope * endUTC);

	//console.log(estimateEndAmount);

	parsedData.push([startUTC, intercept + (slope * startUTC)]);
	parsedData.push([endUTC, intercept + (slope * endUTC)]);

	return parsedData;

	//console.log("Slope: " + slope);
	//console.log("Intercept: " + intercept);
}
//Takes all transactions and returns the array of days and amount spent that day
//in form [[UTCDATE, AMOUNTSPENT],...]
function convertData()
{
	//console.log("Called");
	var days = new Array();
	var parsedData = new Array();
	var lineOptions=document.getElementById("lineOptions");
	var lineValue = lineOptions.options[lineOptions.selectedIndex].value;

	if(lineValue == "All")
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
	else
	{
		for(var i = 0; i < transactions.length; i++)
		{
			if(transactions[i].group == lineValue)
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
        	formatter: function() {
                        return '<b>'+ Highcharts.dateFormat('%A %b. %e', this.x) +'</b><br/>'
                         +'$'+ this.y.toFixed(2);
                }

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
//Uses highcharts.js to create and display line of best fit
//Shows total amount of money only in current semester
function makeBestFitGraph(transactions)
{
	var newData = getTotalLeftData();
	var bestFitData = findLineBestFit(transactions);
    $('#bestFit').highcharts({
       
        title: {
            text: 'Total Left This Semester'
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
                text: 'Dollars Left ($)'
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
        },{
        	name: 'Best Fit',
        	data: bestFitData
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
//Performs upload event
function performClick(node) {
   var evt = document.createEvent("MouseEvents");
   evt.initEvent("click", true, false);
   node.dispatchEvent(evt);
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
