//import * as dependencies from "./modules/modulesDependencies.js";
import loadChartViz from "./modules/visualisationManager.js";
import { displayCode } from "./modules/utils/utils.js";


const endpoint = "http://54.36.123.165:8890/sparql/";
const query = `PREFIX oa:     <http://www.w3.org/ns/oa#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX schema:  <http://schema.org/>
SELECT DISTINCT ?name_construction (COUNT(DISTINCT(?name_animal)) as ?nb)  WHERE {
?annotation1 oa:hasBody ?animal ; oa:hasTarget [ oa:hasSource ?paragraph; oa:hasSelector [ oa:exact ?mention_animal]].
?animal skos:prefLabel ?name_animal.
?animal_collection a skos:Collection;
skos:prefLabel "Ancient class"@en;
skos:member ?animal.

?annotation2 oa:hasBody ?construction;
oa:hasTarget [oa:hasSource ?paragraph;
    oa:hasSelector [oa:exact ?mention_construction]].
?paragraph schema:text ?text.

?construction skos:prefLabel ?name_construction;
            skos:broader+ ?construction_generique.
?construction_generique skos:prefLabel "house building"@en.

FILTER NOT EXISTS {?x  skos:broader ?animal}
FILTER (lang(?name_animal) = "en")
FILTER (lang(?name_construction) = "en")
}
GROUP BY ?name_construction`;

const query_deka = `SELECT DISTINCT ?endpoint ?sparqlNorm (COUNT(DISTINCT ?activity) AS ?count) {
GRAPH ?g {
{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpoint . }
UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpoint . }
UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpoint . }
?metadata <http://ns.inria.fr/kg/index#curated> ?curated, ?dataset .
    { ?dataset <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity . }
    UNION { ?metadata <http://www.w3.org/ns/prov#wasGeneratedBy> ?activity .}
    FILTER(CONTAINS(str(?activity), ?sparqlNorm))
    VALUES ?sparqlNorm { "SPARQL10" "SPARQL11" }
}
}
GROUP BY ?endpoint ?sparqlNorm
ORDER BY ?endpoint ?sparqlNorm`;

const query_deka2 = `SELECT DISTINCT ?endpointUrl (MAX(?rawO) AS ?triples)  (MAX(?raw1) AS ?classes)  (MAX(?raw2) AS ?properties) {
GRAPH ?g {
{ ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . }
UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }
?metadata <http://ns.inria.fr/kg/index#curated> ?curated .
?curated <http://rdfs.org/ns/void#triples> ?rawO .
?curated <http://rdfs.org/ns/void#triples> ?rawO .
?curated <http://rdfs.org/ns/void#classes> ?raw1 .
?curated <http://rdfs.org/ns/void#properties> ?raw2 .
}
} GROUP BY ?endpointUrl`

const query_deka3 = `SELECT DISTINCT ?endpointUrl (MAX(?raw2) AS ?properties) {
    GRAPH ?g {
        { ?curated <http://www.w3.org/ns/sparql-service-description#endpoint> ?endpointUrl . }
        UNION { ?curated <http://rdfs.org/ns/void#sparqlEndpoint> ?endpointUrl . }
        UNION { ?curated <http://www.w3.org/ns/dcat#endpointURL> ?endpointUrl . }
        ?metadata <http://ns.inria.fr/kg/index#curated> ?curated .
    	?curated <http://rdfs.org/ns/void#properties> ?raw2 .
    }
} GROUP BY ?endpointUrl`

const query_4 = `PREFIX oa:     <http://www.w3.org/ns/oa#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX schema:  <http://schema.org/> 
PREFIX paragraph: <http://www.zoomathia.com/>

SELECT DISTINCT ?paragraph 
	(str(?name_animal) as ?animal)
	(str(?name_relation) as ?relationship)
	(str(?name_anthro) as ?anthroponyme) 
WHERE {
  ?annotation1 a oa:Annotation; oa:hasBody ?animal;
	oa:hasTarget [ oa:hasSource ?paragraph;
      oa:hasSelector [ oa:exact ?mention_animal]].

  ?annotation2 oa:hasBody ?relation;
        oa:hasTarget [oa:hasSource ?paragraph;
                      oa:hasSelector [ oa:exact ?mention_relation]].

   ?annotation3 oa:hasBody ?anthro;
        oa:hasTarget [ oa:hasSource ?paragraph;
                       oa:hasSelector [oa:exact ?mention_anthro]].

  ?animal a skos:Concept;
       skos:prefLabel ?name_animal.
  ?animal_collection a skos:Collection;
       skos:prefLabel "Ancient class"@en;
       skos:member ?animal.

  ?relation skos:prefLabel ?name_relation;
     	            skos:broader+ ?relation_generique.
  ?relation_generique skos:prefLabel  "special relationship"@en.

 ?anthro skos:prefLabel ?name_anthro.
 ?anthro_collection skos:prefLabel ?anthro_collection_name;
	skos:member ?anthro.

  FILTER (lang(?name_animal) = "en").
  FILTER (lang(?name_relation) = "en")
  FILTER (lang(?name_anthro) = "en")
  FILTER (?anthro_collection_name in ("Place"@en, "Anthroponym"@en))
}
ORDER BY ?paragraph`;

const parameters = {
    endpoint : "http://prod-dekalog.inria.fr/sparql",
    query : query_deka,
    type : 'bar',
    stacked: true,
    title : "Number feature per norm",
    config : [{
        category : "sparqlNorm",
        label : "endpoint",
        value : "count"
    }]

}
loadChartViz("dekalog-1", parameters);
displayCode("#parameters-dekalog1", parameters);

const parameters2 = {
    endpoint: "http://prod-dekalog.inria.fr/sparql",
    query: query_deka2,
    type: "bar",
    title: "Barchart of number of classes, properties and triples per endpoint",
    scale: "log",
    display: "row",
    config: [{
        category : "nb triples",
        label : "endpointUrl",
        value : "triples"
    },
    {
        category : "nb classes",
        label : "endpointUrl",
        value : "classes"
    },
    {
        category : "nb properties",
        label : "endpointUrl",
        value : "properties"
    }
]
}
loadChartViz("dekalog-2", parameters2)

const parameters3 = {
    endpoint: "http://prod-dekalog.inria.fr/sparql",
    query: query_deka3,
    type: "pie",
    title: "Piechart of number of properties per endpoint",
    config: [
        {
            label: "endpointUrl",
            value: "properties"
        }
    ]
}
loadChartViz("dekalog-3", parameters3);
displayCode("#piechart-deka", parameters3);

const parameters4 = {
    endpoint: "http://54.36.123.165:8890/sparql",
    query: query_4,
    type: "graph",
    animation: false,
    title: "Relationship between human, place and animal",
    config: [
        {
            source:"animal",
            target:"anthroponyme",
            label:"relationship"
        }
    ]
}
loadChartViz("zoomathia", parameters4);