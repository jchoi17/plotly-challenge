  
// create variables to select html elements
var selID = d3.select("#selDataset");
var demographics_table = d3.select("#sample-metadata");
var bar_chart = d3.select("#bar");
var bubble_chart = d3.select("bubble");
var gauge_chart = d3.select("gauge");

// create initial landing page
function initial() {

    // read in data
    d3.json("samples.json").then((data => {

        data.names.forEach((name => {
            var option = selID.append("option");
            option.text(name);
        }));
        var default_id = selID.property("value")

        // plot charts default ID
        getPlots(default_id);

    }));

}

// create function to reset the data when selecting new ID
function reset() {
    demographics_table.html("");
    bar_chart.html("");
    bubble_chart.html("");
    gauge_chart.html("");
}; 

// create function to display charts for chosen data
function getPlots(id) {

    // read in the JSON data
    d3.json("samples.json").then((data => {

        // filter on selected ID
        var id_metadata = data.metadata.filter(d => d.id == id)[0];
        var wfreq = id_metadata.wfreq;

        // loop through data for keys & values
        Object.entries(id_metadata).forEach(([key, value]) => {

            var table_list = demographics_table.append("ul");
            table_list.attr("class", "list-group list-group-flush");
            var item = table_list.append("ul");

            // add data to the demographics table
            item.text(`${key}: ${value}`);

        });

        // filter the samples on ID
        var id_sample = data.samples.filter(d => d.id == id)[0];

        // create empty arrays to store sample data
        var otu_ids = [];
        var otu_labels = [];
        var sample_values = [];

        // loop through OTU data for selected ID
        Object.entries(id_sample).forEach(([key, value]) => {

            switch (key) {
                case "otu_ids":
                    otu_ids.push(value);
                    break;
                case "sample_values":
                    sample_values.push(value);
                    break;
                case "otu_labels":
                    otu_labels.push(value);
                    break;
                default:
                    break;
            }

        }); 

        // slice and reverse the arrays to get the top 10 values, labels and IDs
        var top_otuIDs = otu_ids[0].slice(0, 10).reverse();
        var top_otulabels = otu_labels[0].slice(0, 10).reverse();
        var top_samplevalues = sample_values[0].slice(0, 10).reverse();

        // use the map function to store the IDs with "OTU" for labelling y-axis
        var top_otuIDs_formatted = top_otuIDs.map(otuID => "OTU " + otuID);

        // plot bar chart

        // create trace
        var bar_trace = {
            x: top_samplevalues,
            y: top_otuIDs_formatted,
            text: top_otulabels,
            type: 'bar',
            orientation: 'h',
            marker: {
                color: '3399FF'
            }
        };

        // create the data array for plotting
        var bar_data = [bar_trace];

        // define the plot layout
        var bar_layout = {
            height: 500,
            width: 600,
            title: {
                text: `<b>Top OTUs for Test Subject ${id}</b>`,
                font: {
                    size: 18,
                }
            },
            xaxis: {
                title: "<b>Sample Values<b>",
            },
            yaxis: {
                tickfont: { size: 15 }
            }
        }


        // plot the bar chart to the "bar" div
        Plotly.newPlot("bar", bar_data, bar_layout);

        // Bubble Chart

        // create trace
        var bubble_trace = {
            x: otu_ids[0],
            y: sample_values[0],
            text: otu_labels[0],
            mode: 'markers',
            marker: {
                size: sample_values[0],
                color: otu_ids[0],
                colorscale: 'Rainbow'
            }
        };

        // create the data array for the plot
        var bubble_data = [bubble_trace];

        // define the plot layout
        var bubble_layout = {
     
            xaxis: {
                title: "<b>OTU ID</b>",
            },
            yaxis: {
                title: "<b>Sample Values</b>",
                
            },
            showlegend: false,
        };

        // plot the bubble chat to the appropriate div
        Plotly.newPlot('bubble', bubble_data, bubble_layout);

        // plot gauge chart

        if (wfreq == null) {
            wfreq = 0;
        }

        // create an indicator trace for the gauge chart
        var gauge_trace = {
            domain: { x: [0, 1], y: [0, 1] },
            value: wfreq,
            type: "indicator",
            mode: "gauge",
            gauge: {
                axis: {
                    range: [0, 9],
                    tickmode: 'linear',
                    tickfont: {
                        size: 15
                    }
                },
                bar: { color: 'rgba(0,0,0,0)' },

                steps: [
                    { range: [0, 1], color: 'ivory'},
                    { range: [1, 2], color: 'CCE5FF'},
                    { range: [2, 3], color: '99CCFF'},
                    { range: [3, 4], color: '66B2FF'},
                    { range: [4, 5], color: '3399FF'},
                    { range: [5, 6], color: '0080FF'},
                    { range: [6, 7], color: '0066CC'},
                    { range: [7, 8], color: '004C99'},
                    { range: [8, 9], color: '003366'}
                ]
            }
        };

        // 9 steps for the wfreq gauge
        var angle = (wfreq / 9) * 180;

        var degrees = 180 - angle,
            radius = .8;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // create needle indicator
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            cX = String(x),
            cY = String(y),
            pathEnd = ' Z';
        var path = mainPath + cX + " " + cY + pathEnd;
        var needle_center = {
            type: 'scatter',
            showlegend: false,
            x: [0],
            y: [0],
            marker: { size: 25, color: '850000' },
            name: wfreq,
            hoverinfo: 'name'
        };

        // create a data array from the two traces
        var gauge_data = [gauge_trace, needle_center];

        // define gauge chart layout
        var gauge_layout = {

            shapes: [{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }],

            title: {
                text: `<b>Test Subject ${id}</b><br><b>Belly Button Washing Frequency</b><br><br>Scrubs per Week`,
            },
            height: 500,
            width: 500,
            xaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-1, 1],
                // fixedrange: true 
            },
            yaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-0.5, 1.5],
                // fixedrange: true 
            }
        };

        // plot the gauge chart
        Plotly.newPlot('gauge', gauge_data, gauge_layout);


    })); 
};

// update with new selection
function optionChanged(id) {

    // reset the data & get new charts
    reset();
    getPlots(id);

}

// call the init() function for default data
initial();