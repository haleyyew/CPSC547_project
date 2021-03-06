function createV4SelectableForceDirectedGraph(svg, graph) {
    // if both d3v3 and d3v4 are loaded, we'll assume
    // that d3v4 is called d3v4, otherwise we'll assume
    // that d3v4 is the default (d3)
    if (typeof d3v4 == 'undefined')
        d3v4 = d3;

    var width = +svg.attr("width"),
        height = +svg.attr("height");

    parentWidth = d3v4.select('svg').node().parentNode.clientWidth;
    parentHeight = d3v4.select('svg').node().parentNode.clientHeight;

    var svg = d3v4.select('svg')
        .attr('width', parentWidth)
        .attr('height', parentHeight);

    // remove any previous graphs
    svg.selectAll('.g-main').remove();

    var gMain = svg.append('g')
        .classed('g-main', true);

    var rect = gMain.append('rect')
        .attr('width', parentWidth)
        .attr('height', parentHeight)
        .style('fill', 'white');

    var gDraw = gMain.append('g');

    var zoom = d3v4.zoom()
        .on('zoom', zoomed);

    gMain.call(zoom);


    function zoomed() {
        gDraw.attr('transform', d3v4.event.transform);
    }

    var color = d3v4.scaleOrdinal(d3v4.schemeCategory20);

    if (!("links" in graph)) {
        console.log("Graph is missing links");
        return;
    }

    var nodes = {};
    var i;
    for (i = 0; i < graph.nodes.length; i++) {
        nodes[graph.nodes[i].id] = graph.nodes[i];
        graph.nodes[i].weight = 1.01;
    }
    var speciesNode = graph.nodes.filter(function (d, i) {
        return d.type === "species";
    });
    var reactionsNode = graph.nodes.filter(function (d, i) {
        return d.type === "reactions";
    });
    svg.append("svg:defs")
        .append("svg:marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 27)
        .attr("refY", 5)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("markerWidth", 8)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z");
    // the brush needs to go before the nodes so that it doesn't
    // get called when the mouse is over a node
    var gBrushHolder = gDraw.append('g');
    var gBrush = null;

    var link = gDraw.append("g")
        .attr("class", "link")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("marker-end", "url(\#arrow)")
        .attr("stroke", function (d) {
            if (d.color == 1) {
                console.log("COLOR " + d.source + " " + d.value + " " + d.color);
                return "red";
            } else {
                return "grey";
            }
        })	//Haoran
        .attr("stroke-width", function (d) {
            return Math.sqrt(d.value);
        });

    var species_node = gDraw.append("g")
        .attr("class", "node")
        .selectAll("circle")
        .data(speciesNode)
        .enter().append("circle")
        .filter(function (d, i) {
            return d.type !== "reactions"
        })
        .attr("r", 5)

        .attr("id", function (d, i) {
            console.log("gDraw.append " + "b-" + d.id);
            return "b-" + d.id;
        })

        .attr("fill", function (d) {
            if ('color' in d)
                return d.color;
            else
                return color(d.group);
        })
        .call(d3v4.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    var reactions_node = gDraw.append("g")
        .attr("class", "node")
        .selectAll("rect")
        .data(reactionsNode)
        .enter().append("rect")
        .filter(function (d, i) {
            return d.type === "reactions"
        })
        .attr("width", 8)
        .attr("height", 8)

        .attr("id", function (d, i) {
            console.log("gDraw.append " + "b-" + d.id);
            return "b-" + d.id;
        })

        .attr("fill", function (d) {
            if ('color' in d)
                return d.color;
            else
                return color(d.group);
        })
        .call(d3v4.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // add titles for mouseover blurbs
    //this function deleted

    var simulation = d3v4.forceSimulation()
        .force("link", d3v4.forceLink()
            .id(function (d) {
                return d.id;
            })
            .distance(function (d) {
                return 30;
                //var dist = 20 / d.value;
                //console.log('dist:', dist);

                return dist;
            })
        )
        .force("charge", d3v4.forceManyBody())
        .force("center", d3v4.forceCenter(parentWidth / 2, parentHeight / 2))
        .force("x", d3v4.forceX(parentWidth / 2))
        .force("y", d3v4.forceY(parentHeight / 2));

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        // update node and line positions at every step of 
        // the force simulation
        link.attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        species_node.attr("cx", function (d) {
            return d.x;
        })
            .attr("cy", function (d) {
                return d.y;
            });
        reactions_node.attr("x", function (d) {
            return d.x - 4;
        })
            .attr("y", function (d) {
                return d.y - 4;
            });
    }

    var brushMode = false;
    var brushing = false;

    var brush = d3v4.brush()
        .on("start", brushstarted)
        .on("brush", brushed)
        .on("end", brushended);

    function brushstarted() {
        // keep track of whether we're actively brushing so that we
        // don't remove the brush on keyup in the middle of a selection
        brushing = true;

        species_node.each(function (d) {
            d.previouslySelected = shiftKey && d.selected;
        });

        reactions_node.each(function (d) {
            d.previouslySelected = shiftKey && d.selected;
        });


    }

    rect.on('click', function () {
        species_node.each(function (d) {
            d.selected = false;
            d.previouslySelected = false;
        });
        reactions_node.each(function (d) {
            d.selected = false;
            d.previouslySelected = false;
        });
        species_node.classed("selected", false);
        reactions_node.classed("selected", false);
    });

    function brushed() {
        if (!d3v4.event.sourceEvent) return;
        if (!d3v4.event.selection) return;

        var extent = d3v4.event.selection;

        species_node.classed("selected", function (d) {
            return d.selected = d.previouslySelected ^
                (extent[0][0] <= d.x && d.x < extent[1][0]
                    && extent[0][1] <= d.y && d.y < extent[1][1]);
        });

        reactions_node.classed("selected", function (d) {
            return d.selected = d.previouslySelected ^
                (extent[0][0] <= d.x && d.x < extent[1][0]
                    && extent[0][1] <= d.y && d.y < extent[1][1]);
        });
    }

    function brushended() {
        if (!d3v4.event.sourceEvent) return;
        if (!d3v4.event.selection) return;
        if (!gBrush) return;

        gBrush.call(brush.move, null);

        if (!brushMode) {
            // the shift key has been release before we ended our brushing
            gBrush.remove();
            gBrush = null;
        }

        brushing = false;
    }

    d3v4.select('body').on('keydown', keydown);
    d3v4.select('body').on('keyup', keyup);

    var shiftKey;

    function keydown() {
        shiftKey = d3v4.event.shiftKey;

        if (shiftKey) {
            // if we already have a brush, don't do anything
            if (gBrush)
                return;

            brushMode = true;

            if (!gBrush) {
                gBrush = gBrushHolder.append('g');
                gBrush.call(brush);
            }
        }
    }

    function keyup() {
        shiftKey = false;
        brushMode = false;

        if (!gBrush)
            return;

        if (!brushing) {
            // only remove the brush if we're not actively brushing
            // otherwise it'll be removed when the brushing ends
            gBrush.remove();
            gBrush = null;
        }
    }

    function dragstarted(d) {
        if (!d3v4.event.active) simulation.alphaTarget(0.9).restart();

        if (!d.selected && !shiftKey) {
            // if this node isn't selected, then we have to unselect every other node
            species_node.classed("selected", function (p) {
                return p.selected = p.previouslySelected = false;
            });
            reactions_node.classed("selected", function (p) {
                return p.selected = p.previouslySelected = false;
            });
        }

        d3v4.select(this).classed("selected", function (p) {
            d.previouslySelected = d.selected;
            return d.selected = true;
        });

        species_node.filter(function (d) {
            return d.selected;
        })
            .each(function (d) {
                d.fx = d.x;
                d.fy = d.y;
            });

        reactions_node.filter(function (d) {
            return d.selected;
        })
            .each(function (d) {
                d.fx = d.x;
                d.fy = d.y;
            })

    }

    function dragged(d) {
        species_node.filter(function (d) {
            return d.selected;
        })
            .each(function (d) {
                d.fx += d3v4.event.dx;
                d.fy += d3v4.event.dy;
            });
        reactions_node.filter(function (d) {
            return d.selected;
        })
            .each(function (d) {
                d.fx += d3v4.event.dx;
                d.fy += d3v4.event.dy;
            })
    }

    function dragended(d) {
        if (!d3v4.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        species_node.filter(function (d) {
            return d.selected;
        })
            .each(function (d) {
                d.fx = null;
                d.fy = null;
            });
        reactions_node.filter(function (d) {
            return d.selected;
        })
            .each(function (d) {
                d.fx = null;
                d.fy = null;
            })
    }

    // Add a tip box triggered by click action
    var intro;
    var previous_ID;
    svg.on('click', function () {
        if (intro) intro.remove();
        //clean the background color of the button on the right side
        var button_previous = document.getElementById(previous_ID);
        button_previous.style.background = "#FFFFCC";
        d3.select("#" + "b-" + previous_ID).attr("r", 4);
        d3.select("#" + "b-" + previous_ID).attr("width", 8)
            .attr("height", 8);
    });

    species_node.on('click', function (d) {
        //
        d3.select(this).attr("r", 8);
        //Output a tag
        d3v4.event.stopPropagation();
        //Clear the existing intro
        if (intro) intro.remove();

        intro = gDraw.append("g")
            .attr("transform", "translate(" + d.x + "," + d.y + ")");

        var rect = intro.append("rect")
            .style("fill", "white")
            .style("stroke", "steelblue");

        intro.append("text")
            .text("ID: " + d.id)
            .attr("dy", "1em")
            .attr("x", 5)
            .attr("font-size", "12px");

        intro.append("text")
            .text("Group: " + d.group)
            .attr("dy", "2em")
            .attr("x", 5)
            .attr("font-size", "12px");

        var con = graph.links
            .filter(function (d1) {
                return d1.source.id === d.id;
            })
            .map(function (d1) {
                return d1.target.id;
            });

        intro.append("text")
            .text("Type: " + d.type)
            .attr("dy", "3em")
            .attr("x", 5)
            .attr("font-size", "12px");

        intro.append("text")
            .text("Name: " + d.name)
            .attr("dy", "4em")
            .attr("x", 5)
            .attr("font-size", "12px");

        var bbox = intro.node().getBBox();
        rect.attr("width", bbox.width + 5)
            .attr("height", bbox.height + 5);
        //highlight a button
        var button_to_highlight = document.getElementById(d.id);
        button_to_highlight.style.background = "#66CCFF";
        previous_ID = d.id;
        console.log(d.id)
    });

    reactions_node.on('click', function (d) {
        d3.select(this).attr("width", 15)
            .attr("height", 15);
        //Output a tag
        d3v4.event.stopPropagation();
        //Clear the existing intro
        if (intro) intro.remove();

        intro = gDraw.append("g")
            .attr("transform", "translate(" + d.x + "," + d.y + ")");

        var rect = intro.append("rect")
            .style("fill", "white")
            .style("stroke", "steelblue");

        intro.append("text")
            .text("ID: " + d.id)
            .attr("dy", "1em")
            .attr("x", 5)
            .attr("font-size", "12px");

        intro.append("text")
            .text("Group: " + d.group)
            .attr("dy", "2em")
            .attr("x", 5)
            .attr("font-size", "12px");

        var con = graph.links
            .filter(function (d1) {
                return d1.source.id === d.id;
            })
            .map(function (d1) {
                return d1.target.id;
            });

        intro.append("text")
            .text("Type: " + d.type)
            .attr("dy", "3em")
            .attr("x", 5)
            .attr("font-size", "12px");

        intro.append("text")
            .text("Name: " + d.name)
            .attr("dy", "4em")
            .attr("x", 5)
            .attr("font-size", "12px");

        var bbox = intro.node().getBBox();
        rect.attr("width", bbox.width + 5)
            .attr("height", bbox.height + 5);
        //highlight a button
        var button_to_highlight = document.getElementById(d.id);
        button_to_highlight.style.background = "#66CCFF";
        previous_ID = d.id;


        console.log(d.id)
    });

    return graph;
}
