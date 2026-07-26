console.log("D3 Loaded!");

let currentScene = 0;
let carData = [];

const scenes = [
    {
        title: "Engine Design Shapes Fuel Efficiency: Electric vs. Gasoline",
        description: "Electric vehicles form a distinct high-efficiency group, while gasoline vehicles with more engine cylinders generally achieve lower highway fuel efficiency.",
        annotation: "The overall pattern shows that highway MPG tends to decline as cylinder count increases."
    },
    {
        title: "Four-Cylinder Vehicles Dominate the High-Efficiency Range Among Gasoline Cars",
        description: "Among Gasoline vehicles, four-cylinder vehicles occupy much of the higher-MPG portion of the chart.",
        annotation: "Four-cylinder vehicles are highlighted while other vehicles are faded."
    },
    {
        title: "Explore Individual Vehicles",
        description: "Hover over a point to inspect its make, fuel type, cylinder count, and fuel efficiency.",
        annotation: "Individual vehicles can differ even when they have the same number of cylinders."
    }
];

const annotations = [
    "Overall, highway MPG tends to decrease as cylinder count increases.",
    "Four-cylinder vehicles occupy much of the high-efficiency range.",
    "Hover over each point to explore individual vehicle details."
];

d3.csv("cars2017.csv").then(function(data) {

    data.forEach(function(d) {
        d.EngineCylinders = +d.EngineCylinders;
        d.AverageHighwayMPG = +d.AverageHighwayMPG;
        d.AverageCityMPG = +d.AverageCityMPG;
    });

    carData = data;
    drawScene();

}).catch(function(error) {
    console.error("Error loading CSV:", error);
});

function drawScene() {

    // 清空上一页图表
    d3.select("#chart").html("");

    // 更新页面文字
    d3.select("#scene-title")
        .text(scenes[currentScene].title);

    d3.select("#scene-description")
        .text(scenes[currentScene].description);

    d3.select("#scene-number")
        .text(`Scene ${currentScene + 1} of ${scenes.length}`);

    drawScatterplot();
    updateButtons();
}

function drawScatterplot() {

    const width = 800;
    const height = 500;

    const margin = {
        top: 70,
        right: 40,
        bottom: 70,
        left: 80
    };

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleLinear()
        .domain(d3.extent(carData, d => d.EngineCylinders))
        .nice()
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain(d3.extent(carData, d => d.AverageHighwayMPG))
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(8));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y));

    svg.selectAll("circle")
        .data(carData)
        .join("circle")
        .attr("cx", d => x(d.EngineCylinders))
        .attr("cy", d => y(d.AverageHighwayMPG))
        .attr("r", 5)
        .attr("fill", d => {
            // Scene 1
            if (currentScene === 0) {

                if (d.EngineCylinders === 0) {
                    return "green";      // 电动车
                }

                return "steelblue";      // 燃油车
            }
            // scene 2
            if (currentScene === 1 && d.EngineCylinders === 4) {
                return "orange";
            }
            return "steelblue";
        })
        .attr("opacity", d => {
            if (currentScene === 1 && d.EngineCylinders !== 4) {
                return 0.15;
            }
            return 0.75;
        })
        .on("mouseover", function(event, d) {
        if (currentScene === 2) {
            d3.select("#tooltip")
                .style("display", "block")
                .html(`
                    <strong>${d.Make}</strong><br>
                    Fuel: ${d.Fuel}<br>
                    Cylinders: ${d.EngineCylinders === 0 ? "Electric vehicle" : d.EngineCylinders}<br>
                    Highway MPG: ${d.AverageHighwayMPG}<br>
                    City MPG: ${d.AverageCityMPG}
                `);
            }
        })
        .on("mousemove", function(event) {
            if (currentScene === 2) {
                d3.select("#tooltip")
                    .style("left", `${event.pageX + 12}px`)
                    .style("top", `${event.pageY + 12}px`);
            }
        })
        .on("mouseout", function() {
            d3.select("#tooltip")
                .style("display", "none");
        });

    // X轴名称
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .text("Engine Cylinders");

    // Y轴名称
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Average Highway MPG");

    // 固定显示的 annotation
    svg.append("text")
        .attr("class", "annotation")
        .attr("x", margin.left + 20)
        .attr("y", 35)
        .text(scenes[currentScene].annotation);
    // Scene 1 才显示 legend
    if (currentScene === 0) {

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - margin.right - 110}, ${margin.top + 10})`);

        // Electric vehicles
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 6)
            .attr("fill", "green")
            .attr("opacity", 0.75);

        legend.append("text")
            .attr("x", 14)
            .attr("y", 5)
            .text("Electric Vehicle");

        // Gasoline vehicles
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", 25)
            .attr("r", 6)
            .attr("fill", "steelblue")
            .attr("opacity", 0.75);

        legend.append("text")
            .attr("x", 14)
            .attr("y", 30)
            .text("Gasoline Vehicle");
    }

        // Scene 2
    if (currentScene === 1) {

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - margin.right - 140}, ${margin.top + 10})`);

        // Highlighted 4-cylinder
        legend.append("circle")
            .attr("r", 6)
            .attr("fill", "orange")
            .attr("opacity", 0.75);

        legend.append("text")
            .attr("x", 14)
            .attr("y", 5)
            .text("4-Cylinder Vehicle");

        // Other vehicles
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", 25)
            .attr("r", 6)
            .attr("fill", "steelblue")
            .attr("opacity", 0.15);

        legend.append("text")
            .attr("x", 14)
            .attr("y", 30)
            .text("Other Vehicles");
    }
}

function updateButtons() {

    d3.select("#previous")
        .property("disabled", currentScene === 0);

    d3.select("#next")
        .property("disabled", currentScene === scenes.length - 1);
}

d3.select("#previous").on("click", function() {

    if (currentScene > 0) {
        currentScene--;
        drawScene();
    }
});

d3.select("#next").on("click", function() {

    if (currentScene < scenes.length - 1) {
        currentScene++;
        drawScene();
    }
});