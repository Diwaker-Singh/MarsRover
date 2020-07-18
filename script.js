

var totalRows = 30;
var totalCols = 50;
var inProgress = false;
var cellsToAnimate = [];
var createWalls = false;
var justFinished = false;
var diagonal=false;
var algorithm = "Breadth-First Search (BFS)";
var animationSpeed = "Fast";
var animationState = null;
var startCell = [15, 17];
var endCell = [15, 33];
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
	traverseGraph(algorithm);
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

/* ---------------------------- */
/* --- Speed change control --- */
/* ---------------------------- */

$( "#speed .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	animationSpeed = $(this).text();
	$(".speedDisplay").text("Speed: "+animationSpeed);
	console.log("Speed has been changd to: " + animationSpeed);
});

$( "#Diagonal .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	var diag = $(this).text();
	if(diag=="Allow Diagonal"){
		diagonal=true;
		$(".Diagonal").text("Allow Diagonal");
	}
	else{
		diagonal=false;
		$(".Diagonal").text("No Diagonal Allowed");
	}
	console.log("Diagonal Movements valid? " + diagonal);
});

$( "#algorithms .dropdown-item").click(function(){
	if ( inProgress ){ update("wait"); return; }
	algorithm = $(this).text();
	console.log("Algorithm has been changed to: " + algorithm);
	updateStartBtnText();
});

function updateStartBtnText(){
	if (algorithm == "Depth-First Search (DFS)"){
		$(".algorithmDisplay").html("Algorithm DFS");
	} 
	else if (algorithm == "Breadth-First Search (BFS)"){
		$(".algorithmDisplay").html("Algorithm BFS");
	} 
	else if (algorithm == "Greedy Best-First Search"){
		$(".algorithmDisplay").html("Algorithm Greedy BFS");
	} 
	else if (algorithm == "Jump Point Search"){
		$(".algorithmDisplay").html("Algorithm JPS");
	}
	else{
		$(".algorithmDisplay").text("Algorithm "+algorithm);
	} 
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

async function traverseGraph(algorithm){
    inProgress = true;
	clearBoard( keepWalls = true );
	var startTime = Date.now();
	var pathFound = executeAlgo();
	var endTime = Date.now();
	reorderCellsToAnimate();
	await animateCells();
	if ( pathFound ){ 
		updateResults((endTime - startTime), true, countLength());
	} 
	else {
		updateResults((endTime - startTime), false, countLength());
	}
	inProgress = false;
	justFinished = true;
}

function executeAlgo(){
	if (algorithm == "Depth-First Search (DFS)"){
		var visited = createVisited();
		var pathFound = DFS(startCell[0], startCell[1], visited);
	} 
	else if (algorithm == "Breadth-First Search (BFS)"){
		var pathFound = BFS();
	} 
	else if (algorithm == "Dijkstra"){
		var pathFound = dijkstra();
	} 
	else if (algorithm == "A*"){
		var pathFound = AStar();
	} 
	else if (algorithm == "Greedy Best-First Search"){
		var pathFound = greedyBestFirstSearch();
	} 
	else if (algorithm == "Jump Point Search"){
		var pathFound = jumpPointSearch();
	}
	return pathFound;
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

function minHeap() {
	this.heap = [];
	this.isEmpty = function(){
		return (this.heap.length == 0);
	}
	this.clear = function(){
		this.heap = [];
		return;
	}
	this.getMin = function(){
		if (this.isEmpty()){
			return null;
		}
		var min = this.heap[0];
		this.heap[0] = this.heap[this.heap.length - 1];
		this.heap[this.heap.length - 1] = min;
		this.heap.pop();
		if (!this.isEmpty()){
			this.siftDown(0);
		}
		return min;
	}
	this.push = function(item){
		this.heap.push(item);
		this.siftUp(this.heap.length - 1);
		return;
	}
	this.parent = function(index){
		if (index == 0){
			return null;
		}
		return Math.floor((index - 1) / 2);
	}
	this.children = function(index){
		return [(index * 2) + 1, (index * 2) + 2];
	}
	this.siftDown = function(index){
		var children = this.children(index);
		var leftChildValid = (children[0] <= (this.heap.length - 1));
		var rightChildValid = (children[1] <= (this.heap.length - 1));
		var newIndex = index;
		if (leftChildValid && this.heap[newIndex][0] > this.heap[children[0]][0]){
			newIndex = children[0];
		}
		if (rightChildValid && this.heap[newIndex][0] > this.heap[children[1]][0]){
			newIndex = children[1];
		}
		// No sifting down needed
		if (newIndex === index){ return; }
		var val = this.heap[index];
		this.heap[index] = this.heap[newIndex];
		this.heap[newIndex] = val;
		this.siftDown(newIndex);
		return;
	}
	this.siftUp = function(index){
		var parent = this.parent(index);
		if (parent !== null && this.heap[index][0] < this.heap[parent][0]){
			var val = this.heap[index];
			this.heap[index] = this.heap[parent];
			this.heap[parent] = val;
			this.siftUp(parent);
		}
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
		cellsToAnimate.push( [cell, "visited"] );
	}
	// If a path was found, illuminate it
	if (pathFound){
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

function DFS(i, j, visited){
	if (i == endCell[0] && j == endCell[1]){
		cellsToAnimate.push( [[i, j], "success"] );
		return true;
	}
	visited[i][j] = true;
	cellsToAnimate.push( [[i, j], "searching"] );
	var neighbors = getNeighbors(i, j);
	for(var k = 0; k < neighbors.length; k++){
		var m = neighbors[k][0];
		var n = neighbors[k][1]; 
		if ( !visited[m][n] ){
			var pathFound = DFS(m, n, visited);
			if ( pathFound ){
				cellsToAnimate.push( [[i, j], "success"] );
				return true;
			} 
		}
	}
	cellsToAnimate.push( [[i, j], "visited"] );
	return false;
}

function dijkstra() {
	var pathFound = false;
	var myHeap = new minHeap();
	var prev = createPrev();
	var distances = createDistances();
	var visited = createVisited();
	distances[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
	while (!myHeap.isEmpty()){
		var cell = myHeap.getMin();
		//console.log("Min was just popped from the heap! Heap is now: " + JSON.stringify(myHeap.heap));
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j]){ continue; }
		visited[i][j] = true;
		cellsToAnimate.push([[i, j], "visited"]);
		if (i == endCell[0] && j == endCell[1]){
			pathFound = true;
			break;
		}
		var neighbors = getNeighbors(i, j);
		for (var k = 0; k < neighbors.length; k++){
			var m = neighbors[k][0];
			var n = neighbors[k][1];
			if (visited[m][n]){ continue; }
			var newDistance = distances[i][j] + 1;
			if (newDistance < distances[m][n]){
				distances[m][n] = newDistance;
				prev[m][n] = [i, j];
				myHeap.push([newDistance, [m, n]]);
				//console.log("New cell was added to the heap! It has distance = " + newDistance + ". Heap = " + JSON.stringify(myHeap.heap));
				cellsToAnimate.push( [[m, n], "searching"] );
			}
		}
		//console.log("Cell [" + i + ", " + j + "] was just evaluated! myHeap is now: " + JSON.stringify(myHeap.heap));
	}
	//console.log(JSON.stringify(myHeap.heap));
	// Make any nodes still in the heap "visited"
	while ( !myHeap.isEmpty() ){
		var cell = myHeap.getMin();
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j]){ continue; }
		visited[i][j] = true;
		cellsToAnimate.push( [[i, j], "visited"] );
	}
	// If a path was found, illuminate it
	if (pathFound) {
		var i = endCell[0];
		var j = endCell[1];
		cellsToAnimate.push( [endCell, "success"] );
		while (prev[i][j] != null){
			var prevCell = prev[i][j];
			i = prevCell[0];
			j = prevCell[1];
			cellsToAnimate.push( [[i, j], "success"] );
		}
	}
	return pathFound;
}

function AStar() {
	var pathFound = false;
	var myHeap = new minHeap();
	var prev = createPrev();
	var distances = createDistances();
	var costs = createDistances();
	var visited = createVisited();
	distances[ startCell[0] ][ startCell[1] ] = 0;
	costs[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
	while (!myHeap.isEmpty()){
		var cell = myHeap.getMin();
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j]){ continue; }
		visited[i][j] = true;
		cellsToAnimate.push([[i, j], "visited"]);
		if (i == endCell[0] && j == endCell[1]){
			pathFound = true;
			break;
		}
		var neighbors = getNeighbors(i, j);
		for (var k = 0; k < neighbors.length; k++){
			var m = neighbors[k][0];
			var n = neighbors[k][1];
			if (visited[m][n]){ continue; }
			var newDistance = distances[i][j] + 1;
			if (newDistance < distances[m][n]){
				distances[m][n] = newDistance;
				prev[m][n] = [i, j];
				cellsToAnimate.push( [[m, n], "searching"] );
			}
			var newCost = distances[i][j] + Math.abs(endCell[0] - m) + Math.abs(endCell[1] - n);
			if (newCost < costs[m][n]){
				costs[m][n] = newCost;
				myHeap.push([newCost, [m, n]]);
			}
		}
	}
	// Make any nodes still in the heap "visited"
	while ( !myHeap.isEmpty() ){
		var cell = myHeap.getMin();
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j]){ continue; }
		visited[i][j] = true;
		cellsToAnimate.push( [[i, j], "visited"] );
	}
	// If a path was found, illuminate it
	if (pathFound) {
		var i = endCell[0];
		var j = endCell[1];
		cellsToAnimate.push( [endCell, "success"] );
		while (prev[i][j] != null){
			var prevCell = prev[i][j];
			i = prevCell[0];
			j = prevCell[1];
			cellsToAnimate.push( [[i, j], "success"] );
		}
	}
	return pathFound;
}

function jumpPointSearch() {
	var pathFound = false;
	var myHeap = new minHeap();
	var prev = createPrev();
	var distances = createDistances();
	var costs = createDistances();
	var visited = createVisited();
	var walls = createVisited();
	distances[ startCell[0] ][ startCell[1] ] = 0;
	costs[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
	while (!myHeap.isEmpty()){
		var cell = myHeap.getMin();
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j]){ continue; }
		visited[i][j] = true;
		cellsToAnimate.push([[i, j], "visited"]);
		if (i == endCell[0] && j == endCell[1]){
			pathFound = true;
			break;
		}
		var neighbors = pruneNeighbors(i, j, visited, walls);
		for (var k = 0; k < neighbors.length; k++){
			var m = neighbors[k][0];
			var n = neighbors[k][1];
			if (visited[m][n]){ continue; }
			var newDistance = distances[i][j] + Math.abs(i - m) + Math.abs(j - n);
			if (newDistance < distances[m][n]){
				distances[m][n] = newDistance;
				prev[m][n] = [i, j];
				cellsToAnimate.push( [[m, n], "searching"] );
			}
			var newCost = distances[i][j] + Math.abs(endCell[0] - m) + Math.abs(endCell[1] - n);
			if (newCost < costs[m][n]){
				costs[m][n] = newCost;
				myHeap.push([newCost, [m, n]]);
			}
		}
	}
	// Make any nodes still in the heap "visited"
	while ( !myHeap.isEmpty() ){
		var cell = myHeap.getMin();
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j]){ continue; }
		visited[i][j] = true;
		cellsToAnimate.push( [[i, j], "visited"] );
	}
	// If a path was found, illuminate it:
	if (pathFound) {
		var i = endCell[0];
		var j = endCell[1];
		cellsToAnimate.push( [endCell, "success"] );
		while (prev[i][j] != null){
			var prevCell = prev[i][j];
			x = prevCell[0];
			y = prevCell[1];
			// Loop through and illuminate each cell in between [i, j] and [x, y]
			// Horizontal
			if ((i - x) == 0){
				// Move right
				if (j < y){
					for (var k = j; k < y; k++){
						cellsToAnimate.push( [[i, k], "success"] );
					}
				// Move left
				} else {
					for (var k = j; k > y; k--){
						cellsToAnimate.push( [[i, k], "success"] );
					}
				}
			// Vertical
			} else {
				// Move down
				if (i < x){
					for (var k = i; k < x; k++){
						cellsToAnimate.push( [[k, j], "success"] );
					}
				// Move up
				} else {
					for (var k = i; k > x; k--){
						cellsToAnimate.push( [[k, j], "success"] );
					}
				}
			}
			i = prevCell[0];
			j = prevCell[1];
			cellsToAnimate.push( [[i, j], "success"] );
		}
	}
	return pathFound;
}


function pruneNeighbors(i, j, visited, walls){
	var neighbors = [];
	var stored = {};
	// Scan horizontally
	for (var num = 0; num < 2; num++){
		if (!num){
			var direction = "right";
			var increment = 1;
		} else {
			var direction = "left";
			var increment = -1;
		}
		for (var c = j + increment; (c < totalCols) && (c >= 0); c += increment){
			var xy = i + "-" + c;
			if (visited[i][c]){	break; }
			//Check if same row or column as end cell
			if ((endCell[0] == i || endCell[1] == c) && !stored[xy]){
				neighbors.push([i, c]);
				stored[xy] = true;
				continue;
			}
			// Check if dead end
			var deadEnd = !(xy in stored) && ((direction == "left" && (c > 0) && walls[i][c - 1]) || (direction == "right" && c < (totalCols - 1) && walls[i][c + 1]) || (c == totalCols - 1) || (c == 0));  
			if (deadEnd){
				neighbors.push([i, c]);
				stored[xy] = true;
				break;
			}
			//Check for forced neighbors
			var validForcedNeighbor = (direction == "right" && c < (totalCols - 1) && (!walls[i][c + 1])) || (direction == "left" && (c > 0) && (!walls[i][c - 1]));
			if (validForcedNeighbor){
				checkForcedNeighbor(i, c, direction, neighbors, walls, stored);
			}
		}
	}
	// Scan vertically
	for (var num = 0; num < 2; num++){
		if (!num){
			var direction = "down";
			var increment = 1;
		} else {
			var direction = "up";
			var increment = -1;
		}
		for (var r = i + increment; (r < totalRows) && (r >= 0); r += increment){
			var xy = r + "-" + j;
			if (visited[r][j]){	break; }
			if ((endCell[0] == r || endCell[1] == j) && !stored[xy]){
				neighbors.push([r, j]);
				stored[xy] = true;
				continue;
			}
			// Check if dead end
			var deadEnd = !(xy in stored) && ((direction == "up" && (r > 0) && walls[r - 1][j]) || (direction == "down" && r < (totalRows - 1) && walls[r + 1][j]) || (r == totalRows - 1) || (r == 0));  
			if (deadEnd){
				neighbors.push([r, j]);
				stored[xy] = true;
				break;
			}
			//Check for forced neighbors
			var validForcedNeighbor = (direction == "down" && (r < (totalRows - 1)) && (!walls[r + 1][j])) || (direction == "up" && (r > 0) && (!walls[r - 1][j]));
			if (validForcedNeighbor){
				checkForcedNeighbor(r, j, direction, neighbors, walls, stored);
			}
		}
	}
	return neighbors;
}

function checkForcedNeighbor(i, j, direction, neighbors, walls, stored){
	//console.log(JSON.stringify(walls));
	if (direction == "right"){
		var isForcedNeighbor = ((i > 0) && walls[i - 1][j] && (!walls[i - 1][j + 1])) || ((i < (totalRows - 1)) &&  walls[i + 1][j] && (!walls[i + 1][j + 1]));
		var neighbor = [i, j + 1];
	} else if (direction == "left"){
		var isForcedNeighbor = ((i > 0) && walls[i - 1][j] && !walls[i - 1][j - 1]) || ((i < (totalRows - 1)) && walls[i + 1][j] && !walls[i + 1][j - 1]);
		var neighbor = [i, j - 1];
	} else if (direction == "up"){
		var isForcedNeighbor = ((j < (totalCols - 1)) && walls[i][j + 1] && !walls[i - 1][j + 1]) || ((j > 0) && walls[i][j - 1] && !walls[i - 1][j - 1]);
		var neighbor = [i - 1, j];
	} else {
		var isForcedNeighbor = ((j < (totalCols - 1)) && walls[i][j + 1] && !walls[i + 1][j + 1]) || ((j > 0) && walls[i][j - 1] && !walls[i + 1][j - 1]);
		var neighbor = [i + 1, j];
	}
	var xy = neighbor[0] + "-" + neighbor[1];
	if (isForcedNeighbor && !stored[xy]){
		//console.log("Neighbor " + JSON.stringify(neighbor) + " is forced! Adding to neighbors and stored.")
		neighbors.push(neighbor);
		stored[xy] = true;
	} else {
		//console.log("Is not a forced neighbor..");
	}
	//return;
}

function greedyBestFirstSearch() {
	var pathFound = false;
	var myHeap = new minHeap();
	var prev = createPrev();
	var costs = createDistances();
	var visited = createVisited();
	costs[ startCell[0] ][ startCell[1] ] = 0;
	myHeap.push([0, [startCell[0], startCell[1]]]);
	cellsToAnimate.push([[startCell[0], startCell[1]], "searching"]);
	while (!myHeap.isEmpty()){
		var cell = myHeap.getMin();
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j]){ continue; }
		visited[i][j] = true;
		cellsToAnimate.push([[i, j], "visited"]);
		if (i == endCell[0] && j == endCell[1]){
			pathFound = true;
			break;
		}
		var neighbors = getNeighbors(i, j);
		for (var k = 0; k < neighbors.length; k++){
			var m = neighbors[k][0];
			var n = neighbors[k][1];
			if (visited[m][n]){ continue; }
			var newCost = Math.abs(endCell[0] - m) + Math.abs(endCell[1] - n);
			if (newCost < costs[m][n]){
				prev[m][n] = [i, j];
				costs[m][n] = newCost;
				myHeap.push([newCost, [m, n]]);
				cellsToAnimate.push([[m, n], "searching"]);
			}
		}
	}
	// Make any nodes still in the heap "visited"
	while ( !myHeap.isEmpty() ){
		var cell = myHeap.getMin();
		var i = cell[1][0];
		var j = cell[1][1];
		if (visited[i][j]){ continue; }
		visited[i][j] = true;
		cellsToAnimate.push( [[i, j], "visited"] );
	}
	// If a path was found, illuminate it
	if (pathFound) {
		var i = endCell[0];
		var j = endCell[1];
		cellsToAnimate.push( [endCell, "success"] );
		while (prev[i][j] != null){
			var prevCell = prev[i][j];
			i = prevCell[0];
			j = prevCell[1];
			cellsToAnimate.push( [[i, j], "success"] );
		}
	}
	return pathFound;
}

function createDistances(){
	var distances = [];
	for (var i = 0; i < totalRows; i++){
		var row = [];
		for (var j = 0; j < totalCols; j++){
			row.push(Number.POSITIVE_INFINITY);
		}
		distances.push(row);
	}
	return distances;
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

function getNeighbors(i, j){
	var neighbors = [];
	if ( i > 0 ){ 
		neighbors.push( [i - 1, j] );
	}
	if ( j > 0 ){ 
		neighbors.push( [i, j - 1] );
	}
	if ( i < (totalRows - 1) ){ 
		neighbors.push( [i + 1, j] );
	}
	if ( j < (totalCols - 1) ){ 
		neighbors.push( [i, j + 1] );
	}
	if(diagonal==true){
		if ( i>0 && j>0){ 
			neighbors.push( [i - 1, j - 1] );
		}
		if ( i>0 && j<(totalCols - 1)){ 
			neighbors.push( [i - 1, j + 1] );
		}
		if ( i<(totalRows - 1) && j>0){ 
			neighbors.push( [i + 1, j - 1] );
		}
		if ( i<(totalRows - 1) && j<(totalCols - 1)){ 
			neighbors.push( [i + 1, j + 1] );
		}
	}
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

function reorderCellsToAnimate(){
	var a=new Array();
	for(var i=0;i<cellsToAnimate.length;i++){
		if(cellsToAnimate[i][1]==="success"){
			a.push(cellsToAnimate[i][0]);
		}
	}
	var j=a.length-1;
	for(var i=0;i<cellsToAnimate.length;i++){
		if(cellsToAnimate[i][1]==="success"){
			cellsToAnimate[i][0]=a[j--];
		}
	}
}

function getDelay(){
	var delay;
	if (animationSpeed === "Slow"){
		delay = 30;
	} 
	else if (animationSpeed === "Normal") {
		delay = 15;
	} 
	else if (animationSpeed == "Fast") {
		delay = 0;
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
