function createCoLaDownwardedges(svg, graph) {


    var node_index = {};
    //Zixiao
    //var node_group = {};

    var nodes = graph.nodes;
    var links = graph.links;

    for (var j = 0; j < nodes.length; j++) {
        //zixiao
        //node_group[nodes[j].id] = nodes[j];
        var node = nodes[j];
        node_index[node["id"]] = j;

    }
    //Zixiao filter
    var speciesNode = nodes.filter(function (d, i) {
        return d.type === "species";
    });
    var reactionsNode = nodes.filter(function (d, i) {
        return d.type === "reactions";
    });
    //
    for (var k = 0; k < links.length; k++) {
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

    graph.nodes.forEach(function (v) {
        v.height = v.width = 2 * nodeRadius;
    });

    d3cola
        .nodes(graph.nodes)
        .links(graph.links)
        .flowLayout("y", 30)
        .symmetricDiffLinkLengths(6)
        .start(10, 20, 20);

    // define arrow markers for graph links
    svg.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 16)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#000');

    var path = svg.selectAll(".link")
        .data(graph.links)
        .enter().append('svg:path')
        .attr('class', 'link')
        .attr("marker-end", "url(\#end-arrow)");

    // var node = svg.selectAll(".node")
    //     .data(graph.nodes)
    //   .enter().append("circle")
    //     .attr("class", "node")
    //     .attr("r", nodeRadius)
    //     .style("fill", function (d) { return color(d.group); })
    //     .call(d3cola.drag);
    //modified by Zixiao
    var species_node = svg.append("g")
        .attr("class", "node")
        .selectAll("circle")
        .data(speciesNode)
        .enter().append("circle")
        .filter(function (d, i) {
            return d.type!=="reactions"
        })
        .attr("r", nodeRadius)
        .attr("id", function(d, i) { console.log("gDraw.append "+"b-" + d.id); return "b-" + d.id; })
        .style("fill", function (d) {
            return color(d.group);
        })
        .call(d3cola.drag);

    var reactions_node = svg.append("g")
        .attr("class", "node")
        .selectAll("rect")
        .data(reactionsNode)
        .enter().append("rect")
        .filter(function (d, i) {
            return d.type ==="reactions"
        })
        .attr("width", 8)
        .attr("height", 8)
        .attr("id", function(d, i) { console.log("gDraw.append "+"b-" + d.id); return "b-" + d.id; })
        .style("fill", function (d) {
            return color(d.group);
        })
        .call(d3cola.drag);


    // node.append("title")
    //     .text(function (d) {
    //         return d.name;
    //     });

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
        //modified by Zixiao
        species_node.attr("cx", function (d) {
            return d.x;
        })
            .attr("cy", function (d) {
                return d.y;
            });
        reactions_node.attr("x", function(d) { return d.x-4; })
            .attr("y", function(d) { return d.y-4; });
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
    //added by Zixiao
    var intro;
    //var previous_ID;
    svg.on("click",function(){
        if (intro) intro.remove();
        //clean the background color of the button on the right side
        // var button_previous=document.getElementById(previous_ID);
        // button_previous.style.background="#FFFFCC";
        // d3.select("#"+"b-"+previous_ID).attr("r",4);
        // d3.select("#"+"b-"+previous_ID).attr("width",8)
        //     .attr("height",8);
    });

    species_node.on("click",function(d){
        //
        //d3.select(this).attr("r", 8);
        //Output a tag
        d3.event.stopPropagation();
        //Clear the existing intro
        if (intro) intro.remove();

        intro  = svg.append("g")
            .attr("transform", "translate(" + d.x  + "," + d.y + ")");

        var rect = intro.append("rect")
            .style("fill", "white")
            .style("stroke", "steelblue");

        intro.append("text")
            .text("ID: " + d.id)
            .attr("dy", "1em")
            .attr("x", 5)
            .attr("font-size","12px");

        intro.append("text")
            .text("Group: " + d.group)
            .attr("dy", "2em")
            .attr("x", 5)
            .attr("font-size","12px");

        var con = graph.links
            .filter(function(d1){
                return d1.source.id === d.id;
            })
            .map(function(d1){
                return d1.target.id;
            });

        intro.append("text")
            .text("Type: " + d.type)
            .attr("dy", "3em")
            .attr("x", 5)
            .attr("font-size","12px");

        intro.append("text")
            .text("Name: " + d.name)
            .attr("dy", "4em")
            .attr("x", 5)
            .attr("font-size","12px");

        var bbox = intro.node().getBBox();
        rect.attr("width", bbox.width + 5)
            .attr("height", bbox.height + 5);
        //highlight a button
        // var button_to_highlight= document.getElementById(d.id);
        // button_to_highlight.style.background="#66CCFF";
        // previous_ID=d.id;
        // console.log(d.id)
    });

    reactions_node.on('click',function(d){
        // d3.select(this).attr("width",15)
        //     .attr("height", 15);
        //Output a tag
        d3.event.stopPropagation();
        //Clear the existing intro
        if (intro) intro.remove();

        intro  = svg.append("g")
            .attr("transform", "translate(" + d.x  + "," + d.y + ")");

        var rect = intro.append("rect")
            .style("fill", "white")
            .style("stroke", "steelblue");

        intro.append("text")
            .text("ID: " + d.id)
            .attr("dy", "1em")
            .attr("x", 5)
            .attr("font-size","12px");

        intro.append("text")
            .text("Group: " + d.group)
            .attr("dy", "2em")
            .attr("x", 5)
            .attr("font-size","12px");

        var con = graph.links
            .filter(function(d1){
                return d1.source.id === d.id;
            })
            .map(function(d1){
                return d1.target.id;
            });

        intro.append("text")
            .text("Type: " + d.type)
            .attr("dy", "3em")
            .attr("x", 5)
            .attr("font-size","12px");

        intro.append("text")
            .text("Name: " + d.name)
            .attr("dy", "4em")
            .attr("x", 5)
            .attr("font-size","12px");

        var bbox = intro.node().getBBox();
        rect.attr("width", bbox.width + 5)
            .attr("height", bbox.height + 5);
        //highlight a button
        // var button_to_highlight= document.getElementById(d.id);
        // button_to_highlight.style.background="#66CCFF";
        // previous_ID=d.id;


        console.log(d.id)
    });

}
