d3.csv("data.csv", function(error, healthData) {

    // Log an error if one exists
    if (error) return console.warn(error);
  
    // Print the tvData
    console.log(healthData);

});