
/**
 * This function check if a given category name is a SPARQL variable/binding
 * @param {Header_SPARQL_Result} header 
 * @param {Category_Name} name 
 * @returns boolean
 */
const isSparqlVariable = (header, name) => {
    if (header["vars"].includes(name)) {
        return true;
    }
    return false;
}
/**
 * This function extract all categories in the sparql result in a variable
 * Usage: get all category to harmononize and complete barchart to avoid missing and/or misaligne values
 * @param {SPARQL_Result} results 
 * @param {Vizu_variables_parameters} config 
 * @returns 
 */
const labelExtraction = (results, category) => {
    const categories = [];
    results.forEach(row => {
        if (!categories.includes(row[category]["value"])) {
            categories.push(row[category]["value"])
        }
    });
    return categories
}

/**
 * This function link data label with data category to be sorted as intended.
 * Values in sparql can be not ordered (misalign) or missing (due to count(0) for example).
 * @param {SPARQL_result} results 
 * @param {Vizu_variables_parameters} config 
 * @returns data
 */
const labelCategoryLinking = (results, config) => {
    let data = {}
    let header = results["head"]
    let body = results["results"]["bindings"]
    let categories = []

    config.forEach(conf => {
        if (!conf.hasOwnProperty("category")) {
            categories.push(`${conf.label} -> ${conf.value}`);
            conf["category"] = `${conf.label} -> ${conf.value}`
        } else if (isSparqlVariable(header, conf.category)) {
            categories.push(...labelExtraction(body, conf.category));
        } else {
            categories.push(conf.category);
        }
    })

    for (const row of body) {
        for (const conf of config) {
            let key = conf.label ? row[conf.label]["value"] : ""

            if (!data.hasOwnProperty(key)) {
                data[key] = {}
                categories.forEach(category => {
                    data[key][category] = 0
                })
            }

            if (isSparqlVariable(header, conf.category)) {
                data[key][row[conf.category]["value"]] = row[conf.value]["value"]
            } else {
                data[key][conf.category] = row[conf.value]["value"]
            }
        }
    }
    return data
}

/**
 * This function builds the complient data object format for the visualisation 
 * based on the SPARQL variables given in the config object. This implementation
 * is currently based on ECharts data object and is only complient with ECharts engine.
 * @param {SPARQL_result} results 
 * @param {Vizu_variables_parameters} config 
 * @returns [label, series]
 */
const buildSeries = (results, config) => {
    let series = []
    let label = []

    let data = labelCategoryLinking(results, config.config)

    for (let key in data) {

        label.push(key)

        for (let subkey in data[key]) {
            let element = series.find(elt => elt.name === subkey)
            if (element) {
                element.data.push({ name: key, value: parseInt(data[key][subkey]) })
            } else {
                let obj = {
                    name: subkey,
                    type: 'bar',
                    colorBy: 'series',
                    emphasis: {
                        focus: 'series'
                    },
                    data: [{ name: key, value: parseInt(data[key][subkey]) }]
                }
                if (config.stacked) {
                    obj["stack"] = "total";
                }
                series.push(obj)
            }

        }
    }
    return [label, series]
}

const makeBarChartOption = (context, data, option, parameters) => {
    const [label, series_value] = buildSeries(data, parameters);
    const [axis1, axis2] = parameters.display === "row" ? ["xAxis", "yAxis"] : ["yAxis", "xAxis"]

    option[axis1] = [{
        type: parameters.hasOwnProperty("scale") ? parameters.scale : "value"
    }]
    option[axis2] = [{
        type: "category",
        data: label,
    }]

    option["series"] = series_value

    return option
}

export { makeBarChartOption };

/*
const parameters = {
    type: ['barchart', 'stacked barchart', 'multi-set barchart'],
    visual_mapping: [{
        id: "labelid",
        type: "label",
        variable: 'year',
        display: {
            'word-wrapping': 'wrap',
            color: 'blue'
        }
    },
    {
        id: "valueid",
        type: "value",
        variable: 'nb_paper'
    },
    {
        id: "categoryid",
        type: "category",
        variable: 'teamname',
        display: {
            color: 'RdYlBu'(palette red, yellow, blue)
        }
    }],
    aesthetics: {
        orientations: 'column',
        scale: 'log'
    }
}*/
/*
const parameters = {
    type: 'multi-set barchart',
    visual_mapping: [{
        id: "labelid",
        type: "label",
        variable: 'endpointUrl',
        display: {
            'word-wrapping': 'wrap',
        }
    },
    {
        id: "triplesid",
        type: "value",
        variable: 'triples'
    },
    {
        id: "classesid",
        type: "value",
        variable: 'classes'
    },
    {
        id: "propertiesid",
        type: "value",
        variable: 'properties'
    },
    {
        id: "series1id",
        type: "series",
        label_matching: 'labelid',
        value_matching: 'triplesid'
        display: {
            color: 'RdYlBu' (palette red,yellow,blue)
        }
    },
    {
        id: "series2id",
        type: "series",
        label_matching: 'labelid',
        value_matching: 'classesid'
        display: {
            color: 'RdYlBu' (palette red,yellow,blue)
        }
    },
    {
        id: "series3id",
        type: "series",
        label_matching: 'labelid',
        value_matching: 'propertiesid'
        display: {
            color: 'RdYlBu' (palette red,yellow,blue)
        }
    }],
    aesthetics: {
        orientations: 'column',
        scale: 'log'
    }
}*/