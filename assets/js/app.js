var svgArea = d3.select("body").select("svg");
if (!svgArea.empty()) {
  svgArea.remove();
}

var svgWidth = 960;
var svgHeight = 620;

var margin = {
    top: 20,
    right: 40,
    bottom: 200,
    left: 100
};

var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

var chart = d3.select("#scatter").append("div").classed("chart", true);

var svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosen_x = "poverty";
var chosen_y = "healthcare";

function x_scale(data, chosen_x) {

    var x_linear_scale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosen_x]) * 0.8,
        d3.max(data, d => d[chosen_x]) * 1.2])
        .range([0, width]);

    return x_linear_scale;
}

function y_scale(data, chosen_y) {

    var y_linear_scale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosen_y]) * 0.8,
        d3.max(data, d => d[chosen_y]) * 1.2])
        .range([height, 0]);

    return y_linear_scale;
}

function render_axes_x(new_x_scale, x_axis) {

    var bottom = d3.axisBottom(new_x_scale);

    x_axis.transition()
        .duration(1000)
        .call(bottom);

    return x_axis;

}

function render_axes_y(new_y_scale, y_axis) {

    var bottom = d3.axisLeft(new_y_scale);

    y_axis.transition()
        .duration(1000)
        .call(bottom);

    return y_axis;

}

function circle_render(circles_group, new_x_scale, chosen_x,
    new_y_scale, chosen_y) {

    circles_group.transition()
        .duration(1000)
        .attr("cx", d => new_x_scale(d[chosen_x]))
        .attr("cy", d => new_y_scale(d[chosen_y]));

    return circles_group;
}

function text_render(text_group, new_x_scale, chosen_x,
    new_y_scale, chosen_y) {

    text_group.transition()
        .duration(1000)
        .attr("x", d => new_x_scale(d[chosen_x]))
        .attr("y", d => new_y_scale(d[chosen_y]));

    return text_group;
}

function style_x(value, chosen_x) {

    if (chosen_x == "poverty") {
        return `${value}`;
    } else if (chosen_x == "income") {
        return `$${value}`;
    } else {
        return `${value}`;
    }
}

function tooltip_update(chosen_x, chosen_y, circles_group) {

    if (chosen_x == "poverty") {
        var label_x = "Poverty: ";
    } else if (chosen_x == "income") {
        var label_x = "Median Income: ";
    } else {
        var label_x = "Age: ";
    }

    if (chosen_y == "healthcare") {
        var label_y = "No Healthcare: ";
    } else if (chosen_y == "obesity") {
        var label_y = "Obesity: ";
    } else {
        var label_y = "Smokers: ";
    }

    var tooltip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (data) {
            return (`${data.state}<br>${label_x} ${style_x(data[chosen_x], chosen_x)}
            <br>${label_y} ${data[chosen_y]}%`);
        });

    circles_group.call(tooltip);

    circles_group.on("mouseover", tooltip.show)
        .on("mouseout", tooltip.hide);

    return circles_group;
}

d3.csv("./assets/data/data.csv").then(function(healthData) {

    // Print the tvData
    console.log(healthData);

    healthData.forEach(function (data) {
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    var x_linear_scale = x_scale(healthData, chosen_x);
    var y_linear_scale = y_scale(healthData, chosen_y);

    var axis_bottom = d3.axisBottom(x_linear_scale);
    var axis_left = d3.axisLeft(y_linear_scale);

    var x_axis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(axis_bottom);

    var y_axis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(axis_left);

    var circles_group = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => x_linear_scale(d[chosen_x]))
        .attr("cy", d => y_linear_scale(d[chosen_y]))
        .attr("r", 12)
        .attr("opacity", "0.5");

    var text_group = chartGroup.selectAll(".stateText")
        .data(healthData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => x_linear_scale(d[chosen_x]))
        .attr("y", d => y_linear_scale(d[chosen_y]))
        .attr("dy", 3)
        .attr("font-size", "10px")
        .text(function (d) {
            return d.abbr;
        });

    var label_x_group = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    var label_poverty = label_x_group.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .text("In Poverty (%)");

    var label_age = label_x_group.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .text("Median Age");

    var label_income = label_x_group.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .text("Median Income");

    var label_y_group = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left / 4}, ${height / 2})`);

    var label_healthcare = label_y_group.append("text")
        .classed("aText", true)
        .classed("active", true)
        .attr("x", 0)
        .attr("y", 0 - 20)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");

    var label_smoke = label_y_group.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 40)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")
        .text("Smokes (%)");

    var label_obesity = label_y_group.append("text")
        .classed("aText", true)
        .classed("inactive", true)
        .attr("x", 0)
        .attr("y", 0 - 60)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity")
        .text("Obese (%)");

    var circles_group = tooltip_update(chosen_x, chosen_y, circles_group);

    label_x_group.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");

            if (value != chosen_x) {
                chosen_x = value;

                x_linear_scale = x_scale(healthData, chosen_x);
                x_axis = render_axes_x(x_linear_scale, x_axis);
                circles_group = circle_render(circles_group, x_linear_scale, chosen_x,
                    y_linear_scale, chosen_y);
                text_group = text_render(text_group, x_linear_scale, chosen_x,
                    y_linear_scale, chosen_y);
                circles_group = tooltip_update(chosen_x, chosen_y, circles_group);

                if (chosen_x == "poverty") {
                    label_poverty.classed("active", true).classed("inactive", false);
                    label_age.classed("active", false).classed("inactive", true);
                    label_income.classed("active", false).classed("inactive", true);
                } else if (chosen_x == "age") {
                    label_poverty.classed("active", false).classed("inactive", true);
                    label_age.classed("active", true).classed("inactive", false);
                    label_income.classed("active", false).classed("inactive", true);
                } else {
                    label_poverty.classed("active", false).classed("inactive", true);
                    label_age.classed("active", false).classed("inactive", true);
                    label_income.classed("active", true).classed("inactive", false);
                }
            }
        });

    label_y_group.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");

            if (value != chosen_y) {
                chosen_y = value;

                y_linear_scale = y_scale(healthData, chosen_y);
                y_axis = render_axes_y(y_linear_scale, y_axis);
                circles_group = circle_render(circles_group, x_linear_scale, chosen_x,
                    y_linear_scale, chosen_y);
                text_group = text_render(text_group, x_linear_scale, chosen_x,
                    y_linear_scale, chosen_y);
                circles_group = tooltip_update(chosen_x, chosen_y, circles_group);

                if (chosen_y == "obesity") {
                    label_obesity.classed("active", true).classed("inactive", false);
                    label_smoke.classed("active", false).classed("inactive", true);
                    label_healthcare.classed("active", false).classed("inactive", true);
                } else if (chosen_y == "smokes") {
                    label_obesity.classed("active", false).classed("inactive", true);
                    label_smoke.classed("active", true).classed("inactive", false);
                    label_healthcare.classed("active", false).classed("inactive", true);
                } else {
                    label_obesity.classed("active", false).classed("inactive", true);
                    label_smoke.classed("active", false).classed("inactive", true);
                    label_healthcare.classed("active", true).classed("inactive", false);
                }
            }
        });

});