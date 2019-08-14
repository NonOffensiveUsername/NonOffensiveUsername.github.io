function genVoronoi(width, height, numRegions) {
	points = []
	grid = []
	for (i = 0; i < numRegions; i++) {
		x = Math.floor(Math.random() * width)
		y = Math.floor(Math.random() * height)
		points.push([x, y])
	}
	for (e = 0; e < height; e++) {
		buffer = []
		for (o = 0; o < width; o++) {
			buffer.push(-1)
		}
		grid.push(buffer)
	}
	for (e = 0; e < width; e++) {
		for (o = 0; o < height; o++) {
			closestPoint = -1
			pointDist = 10000000000
			for (pointer = 0; pointer < points.length; pointer++) {
				curPoint = points[pointer]
				curPixel = [e, o]
				if (getDist(curPoint, curPixel) < pointDist) {
					closestPoint = pointer
					pointDist = getDist(curPoint, curPixel)
				}
			}
			grid[o][e] = closestPoint
		}
	}
	
	return grid
}

// grid: the grid of the voronoi diagram
// numregions: the number of distinct regions in the diagram
// biomeData: an array of percentages representing biome distribution
// oceanCoverage: a number between 0 and 1 representing ocean coverage
function gridToBiomes(grid, numRegions, biomeData, oceanCoverage) {
	biomeNames = [ "grass", "forest", "marsh", "jungle", "desert", "tundra", "mountain", "arctic", "magma"]
	finalDistribution = []
	numOceans = Math.floor(numRegions * oceanCoverage)
	for (n = 0; n < numOceans; n++) {
		finalDistribution.push('ocean')
	}
	for (i = 0; i < biomeData.length; i++) {
		numBiome = Math.floor(numRegions * (biomeData[i] * (1-oceanCoverage)))
		console.log(biomeNames[i] + ": " + numBiome)
		for (e = 0; e < numBiome; e++) {
			finalDistribution.push(biomeNames[i])
		}
	}
	while (numRegions > finalDistribution.length) {
		finalDistribution.push('ocean')
	}
	//mapping the final distribution onto the grid
	for (i = 0; i < grid.length; i++) {
		for (e = 0; e < grid[0].length; e++) {
			grid[i][e] = finalDistribution[grid[i][e]]
		}
	}
	return grid
}

function gridPropogate(grid, numPassesA, numPassesB) {
	for (i = 0; i < numPassesA; i++) {
		for (y = 5; y < grid.length-5; y++) {
			for (x = 5; x < grid[0].length-5; x++) {
				// plus or minus 2 on both axes
				if (grid[y][x] != 'ocean') {
					dX = Math.floor(Math.random() * 11) - 5
					dY = Math.floor(Math.random() * 11) - 5
					grid[y + dY][x + dX] = grid[y][x]
				}
			}
		}
	}
	for (i = 0; i < numPassesB; i++) {
		for (y = 1; y < grid.length-1; y++) {
			for (x = 1; x < grid[0].length-1; x++) {
				// plus or minus 2 on both axes
				if (grid[y][x] != 'ocean') {
					dX = Math.floor(Math.random() * 3) - 1
					dY = Math.floor(Math.random() * 3) - 1
					grid[y + dY][x + dX] = grid[y][x]
				}
			}
		}
	}
	return grid
}

function smoothGrid(grid, numPasses, strictness) {
	for (i = 0; i < numPasses; i++) {
		for (y = 1; y < grid.length-1; y++) {
			for (x = 1; x < grid[0].length-1; x++) {
				neighbors = []
				neighbors.push(grid[y-1][x-1])
				neighbors.push(grid[y-1][x])
				neighbors.push(grid[y-1][x+1])
				neighbors.push(grid[y][x-1])
				neighbors.push(grid[y][x+1])
				neighbors.push(grid[y+1][x-1])
				neighbors.push(grid[y+1][x])
				neighbors.push(grid[y+1][x+1])
				for (e = 0; e < neighbors.length; e++) {
					numElements = 0
					for (o = 0; o < neighbors.length; o++) {
						if (neighbors[e] == neighbors[o]) {
							numElements++
						}
					}
					if (numElements >= strictness) {
						grid[y][x] = neighbors[e]
					}
				}
			}
		}
	}
	return grid
}

function renderVoronoi(voronoi, cellSize) {
	canvas = document.getElementById('canvas')
	ctx = canvas.getContext('2d')
	for (i = 0; i < voronoi.length; i++) {
		for (e = 0; e < voronoi[0].length; e++) {
			x = e * cellSize
			y = i * cellSize
			ctx.fillStyle = "#000000"
			biomeNames = [ "grass", "forest", "marsh", "jungle", "desert", "tundra", "mountain", "arctic", "magma", "ocean" ]
			biomeColors = [ "#00CC00", "#007700", "#003355", "#00FF00", "#fceb05", "#EEEEFF", "#555555", "#FFFFFF", "#DD0033", "#0000FF" ]
			ctx.fillStyle = biomeColors[biomeNames.indexOf(voronoi[i][e])]
			//ctx.fillStyle = colors[voronoi[i][e]]
			ctx.fillRect(x, y, cellSize, cellSize)
		}
	}
}

function getDist(point1, point2) {
	a = point2[0] - point1[0]
	b = point2[1] - point1[1]
	c = Math.sqrt(a ** 2 + b ** 2)
	return c
}

function makeMap() {
	newVoronoi = genVoronoi(800, 400, 200)
	biomeData = [ .4, .1, .1, 0, .2, .1, .1, 0, 0 ]
	finalGrid = gridToBiomes(newVoronoi, 200, biomeData, .8)
	finalGrid = gridPropogate(finalGrid, 5, 10)
	finalGrid = smoothGrid(finalGrid, 2, 5)
	renderVoronoi(finalGrid, 1)
}