

function createCoLaDownwardedges(svg, graph) {


	var node_index = {}
	
	var nodes = graph.nodes;
	var links = graph.links;
	
	for (var j = 0; j < nodes.length; j++){
		var node = nodes[j];
		node_index[node["id"]] = j;
		
	}
	
	for (var k = 0; k < links.length; k++){
		var link = links[k];
		link["source"] = node_index[link["source"]];
		link["target"] = node_index[link["target"]];
		
		console.log(link["source"]);
		console.log(link["target"]);
	}

	console.log(graph.links);

    var width = 960,
        height = 500;
        
    d3.select("#network_visualization").selectAll("*").remove();
        
    var svg = d3.select("#network_visualization").append("svg")
        .attr("width", width)
        .attr("height", height);        

    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var d3cola = cola.d3adaptor(d3)
        .avoidOverlaps(true)
        .size([width, height]);


        var nodeRadius = 5;

        graph.nodes.forEach(function (v) { v.height = v.width = 2 * nodeRadius; });

        d3cola
            .nodes(graph.nodes)
            .links(graph.links)
            .flowLayout("y", 30)
            .symmetricDiffLinkLengths(6)
            .start(10,20,20);

        // define arrow markers for graph links
        svg.append('svg:defs').append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 6)
            .attr('markerWidth', 3)
            .attr('markerHeight', 3)
            .attr('orient', 'auto')
          .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#000');

        var path = svg.selectAll(".link")
            .data(graph.links)
          .enter().append('svg:path')
            .attr('class', 'link');

        var node = svg.selectAll(".node")
            .data(graph.nodes)
          .enter().append("circle")
            .attr("class", "node")
            .attr("r", nodeRadius)
            .style("fill", function (d) { return color(d.group); })
            .call(d3cola.drag);

        node.append("title")
            .text(function (d) { return d.name; });

        d3cola.on("tick", function () {
            path.each(function (d) {

            });
            // draw directed edges with proper padding from node centers
            path.attr('d', function (d) {
                var deltaX = d.target.x - d.source.x,
                    deltaY = d.target.y - d.source.y,
                    dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                    normX = deltaX / dist,
                    normY = deltaY / dist,
                    sourcePadding = nodeRadius,
                    targetPadding = nodeRadius + 2,
                    sourceX = d.source.x + (sourcePadding * normX),
                    sourceY = d.source.y + (sourcePadding * normY),
                    targetX = d.target.x - (targetPadding * normX),
                    targetY = d.target.y - (targetPadding * normY);
                return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
            });

            node.attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });
        });
        // turn on overlap avoidance after first convergence
        //cola.on("end", function () {
        //    if (!cola.avoidOverlaps()) {
        //        graph.nodes.forEach(function (v) {
        //            v.width = v.height = 10;
        //        });
        //        cola.avoidOverlaps(true);
        //        cola.start();
        //    }
        //});


}
