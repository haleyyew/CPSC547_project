function createV4BarChart(svg, chart){
		
	var dataArray = chart["values"];	
	var labelArray = chart["keys"];	
	
	//console.log(dataArray);
	var dataCountArray = []
	var total = 0;
	for (var i = 0; i < dataArray.length; i++){
		dataCountArray[i] = dataArray[i].length;
		total += dataArray[i].length;
	}

		
	var width = 960,
	height = 100,	
	margin = {top: 20, right: 20, bottom: 30, left: 40};
	
	d3.select("#barchart").selectAll("*").remove();
        
    var svg = d3.select("#barchart").append("svg")
        .attr("width", width)
        .attr("height", height);  	
	
	svg.selectAll("rect")
		.data(dataArray)
		.enter().append("rect")
			  .attr("class", "bar")
			  .attr("fill", "grey")
			  .attr("id", 0)
			  .on('click', function(d,i) {
				  
					if (this.id == 0){
						for (var i = 0; i < d.length; i++){
							var id = d[i];
							var button_to_highlight= document.getElementById(id);
							button_to_highlight.style.background="#FF0000";
							this.id = 1;
						}
					} else {
						for (var i = 0; i < d.length; i++){
							var id = d[i];
							var button_to_highlight= document.getElementById(id);
							button_to_highlight.style.background="#FFFFFF";
							this.id = 0;
						}						
					}
				})
			  .attr("height", function(d, i) {return (height*d.length/total)})
			  .attr("width","40")
			  .attr("x", function(d, i) {return (i * 60) + 25})
			  .attr("y", function(d, i) {return height - (height*d.length/total);});

	svg.selectAll("text")
		.data(labelArray)
		.enter().append("text")
		.text(function(d) {return d})
			   .attr("class", "text")
			   .attr("x", function(d, i) {return (i * 60) + 36})
			   .attr("y", function(d, i) {return 20;});
			   
			   

}
