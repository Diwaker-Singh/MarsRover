

var totalRows = 40;
var totalCols = 60;
var inProgress = false;
var cellsToAnimate = [];
var createWalls = false;
var justFinished = false;
var animationSpeed = "Fast";
var animationState = null;
var startCell = [11, 15];
var endCell = [11, 17];
var movingStart = false;
var movingEnd = false;

function generateGrid( rows, cols ) {
    var grid = "<table>";
    for ( row = 1; row <= totalRows; row++ ) {
        grid += "<tr>"; 
        for ( col = 1; col <= totalCols; col++ ) {      
            grid += "<td></td>";
        }
        grid += "</tr>"; 
    }
    grid += "</table>"
    return grid;
}

$( "#maze" ).append(generateGrid());

/* ----------------- */
/* ---- BUTTONS ---- */
/* ----------------- */

$( "#startBtn" ).click(function(){
    if ( inProgress ){ update("wait"); return; }
	traverseGraph();
});

$( "#clearBtn" ).click(function(){
    if ( inProgress ){ update("wait"); return; }
	clearBoard(keepWalls = false);
});


/* ----------------- */
/* ---- MOUSE ---- */
/* ----------------- */


$( "td" ).mousedown(function(){
	var index = $( "td" ).index( this );
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	if ( !inProgress ){
		if ( justFinished  && !inProgress ){ 
			clearBoard( keepWalls = true ); 
			justFinished = false;
		}
		if (index == startCellIndex)
			movingStart = true;
		else if (index == endCellIndex)
			movingEnd = true;
		else 
			createWalls = true;
	}
});

$( "td" ).mouseup(function(){
	createWalls = false;
	movingStart = false;
	movingEnd = false;
});

$( "td" ).mouseenter(function() {
	if (!createWalls && !movingStart && !movingEnd){ return; }
    var index = $( "td" ).index( this );
    var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
    if (!inProgress){
    	if (justFinished){ 
    		clearBoard( keepWalls = true );
    		justFinished = false;
    	}
    	if (movingStart && index != endCellIndex)
    		moveStartOrEnd(startCellIndex, index, "start");
    	else if (movingEnd && index != startCellIndex) 
    		moveStartOrEnd(endCellIndex, index, "end");
    	else if (index != startCellIndex && index != endCellIndex) 
    		$(this).toggleClass("wall");
    }
});

$( "td" ).click(function() {
    var index = $( "td" ).index( this );
    var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
    if ((inProgress == false) && !(index == startCellIndex) && !(index == endCellIndex)){
    	if ( justFinished ){ 
    		clearBoard( keepWalls = true );
    		justFinished = false;
    	}
    	$(this).toggleClass("wall");
    }
});

$( "body" ).mouseup(function(){
	createWalls = false;
	movingStart = false;
	movingEnd = false;
});


function moveStartOrEnd(prevIndex, newIndex, startOrEnd){
	var newCellY = newIndex % totalCols;
	var newCellX = Math.floor((newIndex - newCellY) / totalCols);
	if (startOrEnd == "start")
    	startCell = [newCellX, newCellY];
    else 
    	endCell = [newCellX, newCellY];
    clearBoard(keepWalls = true);
}

function moveEnd(prevIndex, newIndex){
	$($("td").find(prevIndex)).removeClass();

	var newEnd = $("td").find(newIndex);
	$(newEnd).removeClass();
    $(newEnd).addClass("end");

    var newEndX = Math.floor(newIndex / totalRows);
	var newEndY = Math.floor(newIndex / totalCols);
    startCell = [newStartX, newStartY];
}

/* ---------------------------- */
/* --- Speed change control --- */
/* ---------------------------- */

$( "#speed .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	animationSpeed = $(this).text();
	updateSpeedDisplay();
	console.log("Speed has been changd to: " + animationSpeed);
});

function updateSpeedDisplay(){
	if (animationSpeed == "Slow")
		$(".speedDisplay").text("Speed: Slow");
	
	else if (animationSpeed == "Normal")
		$(".speedDisplay").text("Speed: Normal");
	
	else if (animationSpeed == "Fast")
		$(".speedDisplay").text("Speed: Fast");
}

function update(message){
	$("#resultsIcon").removeClass();
	$("#resultsIcon").addClass("fas fa-exclamation");
	$('#results').css("background-color", "#ffc107");
	$("#length").text("");
	if (message == "wait"){
		$("#duration").text("Please wait for the algorithm to finish.");
	}
}

// Used to display results
function updateResults(duration, pathFound, length){
	var firstAnimation = "swashOut";
	var secondAnimation = "swashIn";
	$("#results").removeClass();
    $("#results").addClass("magictime " + firstAnimation); 
    setTimeout(function(){ 
    	$("#resultsIcon").removeClass();
    	if (pathFound){
    		$('#results').css("background-color", "#77dd77");
    		$("#resultsIcon").addClass("fas fa-check");
    	} else {
    		$('#results').css("background-color", "#ff6961");
    		$("#resultsIcon").addClass("fas fa-times");
    	}
    	$("#duration").text("Duration: " + duration + " ms");
    	$("#length").text("Length: " + length);
    	$('#results').removeClass(firstAnimation);
    	$('#results').addClass(secondAnimation); 
    }, 1100);
}

// Counts length of success
function countLength(){
	var cells = $("td");
	var l = 0;
	for (var i = 0; i < cells.length; i++){
		if ($(cells[i]).hasClass("success")){
			l++;
		}
	}
	return l;
}

async function traverseGraph(){
    inProgress = true;
	clearBoard( keepWalls = true );
	var startTime = Date.now();
	var pathFound = BFS();
	var endTime = Date.now();
	await animateCells();
	if ( pathFound ){ 
		updateResults((endTime - startTime), true, countLength());
	} else {
		updateResults((endTime - startTime), false, countLength());
	}
	inProgress = false;
	justFinished = true;
}

function makeWall(cell){
	if (!createWalls){return;}
    var index = $( "td" ).index( cell );
    var row = Math.floor( ( index ) / totalRows) + 1;
    var col = ( index % totalCols ) + 1;
    console.log([row, col]);
    if ((inProgress == false) && !(row == 1 && col == 1) && !(row == totalRows && col == totalCols)){
    	$(cell).toggleClass("wall");
    }
}

function createVisited(){
	var visited = [];
	var cells = $("#maze").find("td");
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){
			if (cellIsAWall(i, j, cells)){
				row.push(true);
			} else {
				row.push(false);
			}
		}
		visited.push(row);
	}
	return visited;
}

function cellIsAWall(i, j, cells){
	var cellNum = (i * (totalCols)) + j;
	return $(cells[cellNum]).hasClass("wall");
}

function Queue() { 
 this.stack = new Array();
 this.dequeue = function(){
  	return this.stack.pop(); 
 } 
 this.enqueue = function(item){
  	this.stack.unshift(item);
  	return;
 }
 this.empty = function(){
 	return ( this.stack.length == 0 );
 }
 this.clear = function(){
 	this.stack = new Array();
 	return;
 }
}


// NEED TO REFACTOR AND MAKE LESS LONG
function BFS(){
	var pathFound = false;
	var myQueue = new Queue();
	var prev = createPrev();
	var visited = createVisited();
	myQueue.enqueue( startCell );
	cellsToAnimate.push(startCell, "searching");
	visited[ startCell[0] ][ startCell[1] ] = true;
	while ( !myQueue.empty() ){
		var cell = myQueue.dequeue();
		var r = cell[0];
		var c = cell[1];
		cellsToAnimate.push( [cell, "visited"] );
		if (r == endCell[0] && c == endCell[1]){
			pathFound = true;
			break;
		}
		// Put neighboring cells in queue
		var neighbors = getNeighbors(r, c);
		for (var k = 0; k < neighbors.length; k++){
			var m = neighbors[k][0];
			var n = neighbors[k][1];
			if ( visited[m][n] ) { continue ;}
			visited[m][n] = true;
			prev[m][n] = [r, c];
			cellsToAnimate.push( [neighbors[k], "searching"] );
			myQueue.enqueue(neighbors[k]);
		}
	}
	// Make any nodes still in the queue "visited"
	while ( !myQueue.empty() ){
		var cell = myQueue.dequeue();
		var r = cell[0];
		var c = cell[1];
		cellsToAnimate.push( [cell, "visited"] );
	}
	// If a path was found, illuminate it
	if (pathFound) {
		var r = endCell[0];
		var c = endCell[1];
		cellsToAnimate.push( [[r, c], "success"] );
		while (prev[r][c] != null){
			var prevCell = prev[r][c];
			r = prevCell[0];
			c = prevCell[1];
			cellsToAnimate.push( [[r, c], "success"] );
		}
	}
	return pathFound;
}

function createPrev(){
	var prev = [];
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){
			row.push(null);
		}
		prev.push(row);
	}
	return prev;
}

function getNeighbors(i, j){
	var neighbors = [];
	if ( i > 0 ){ neighbors.push( [i - 1, j] );}
	if ( j > 0 ){ neighbors.push( [i, j - 1] );}
	if ( i < (totalRows - 1) ){ neighbors.push( [i + 1, j] );}
	if ( j < (totalCols - 1) ){ neighbors.push( [i, j + 1] );}
	return neighbors;
}

async function animateCells(){
	animationState = null;
	var cells = $("#maze").find("td");
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	var delay = getDelay();
	for (var i = 0; i < cellsToAnimate.length; i++){
		var cellCoordinates = cellsToAnimate[i][0];
		var x = cellCoordinates[0];
		var y = cellCoordinates[1];
		var num = (x * (totalCols)) + y;
		if (num == startCellIndex || num == endCellIndex){ continue; }
		var cell = cells[num];
		var colorClass = cellsToAnimate[i][1];

		// Wait until its time to animate
		await new Promise(resolve => setTimeout(resolve, delay));

		$(cell).removeClass();
		$(cell).addClass(colorClass);
	}
	cellsToAnimate = [];
	//console.log("End of animation has been reached!");
	return new Promise(resolve => resolve(true));
}


function getDelay(){
	var delay;
	if (animationSpeed === "Slow"){
		delay = 20;
	} 
	else if (animationSpeed === "Normal") {
		delay = 10;
	} 
	else if (animationSpeed == "Fast") {
		delay = 5;
	}
	console.log("Delay = " + delay);
	return delay;
}

function clearBoard( keepWalls ){
	var cells = $("#maze").find("td");
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	for (var i = 0; i < cells.length; i++){
			isWall = $( cells[i] ).hasClass("wall");
			$( cells[i] ).removeClass();
			if (i == startCellIndex){
				$(cells[i]).addClass("start"); 
			} else if (i == endCellIndex){
				$(cells[i]).addClass("end"); 
			} else if ( keepWalls && isWall ){ 
				$(cells[i]).addClass("wall"); 
			}
	}
}

// Ending statements
clearBoard();
