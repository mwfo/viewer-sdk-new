import { DataFrame } from "danfojs";
import axios from "axios";
import crossfilter from "crossfilter" 

console.log("Worker started");

let status = "need credentials";
let url = null;
let models = null
let elements = null;
let df = null

const actions = {
  setup: data => {
    url = data.url;
    let token = `Bearer ${data.token}`;

    axios.interceptors.request.use(function (config) {
      (config.headers["Authorization"] = token),
        (config.headers["Content-Type"] = "application/json");
      return config;
    });
    status = "ready";
  },
  status: (data) => {
    postMessage(status)
  },
  getData: () => {
    postMessage({type: "elements", data: elements});
    return;
  },
  refetch: () => {
    status = "loading";
    fetchModels()
    fetchSimpleElements();
    postMessage(elements);
    return;
  }, 
  elementTypes: () => {

  }

};

onmessage = event => {
  console.log("received message", event);
  actions[event.data.type](event.data)
};


async function fetchModels() {
  const data = await axios.get(url + "/model?type=IFC") //fetch only IFC
    .then(result => result.data.filter(item => item.status === 'C')) //only completed Models "status: 'C'"
  return data
}


function reduceElements(modelId, elem){
  let data = Object.entries(elem).map(([elementId, psets]) =>
      Object.entries(psets).map(([pset, properties]) =>
          Object.entries(properties).reduce((accumulator, [property, value]) => 
          {
              accumulator[`${pset}.${property}`] = value;
              return accumulator;
            },{}
          )
        )
        .reduce(
          (result, current) => {
            Object.assign(result, current);
            return result;
          },
          { modelId: modelId, elementId: elementId }
        )
  )
  return data;
}


async function fetchSimpleElements() {
  if(!models){
    models = await fetchModels()
    console.log(models)
  }
  const modelIds = models.map(item => item.id);
  const data = await Promise.allSettled(
    modelIds.map(id =>
      axios
        .get(url + `/model/${id}/element/simple`)
        .then(result => [id, result.data])
        .catch(e => console.error(`Loading Model with id "${id}" failed!`))
    )
  )
    .then(result => result.filter(item => item.status === "fulfilled"))
    .then(result => Object.fromEntries(result.map(item => item.value)));
  

    let reduced = Object.entries(data).reduce((result, [modelId, elements]) => {
      result[modelId] = reduceElements(modelId, elements)
     return result
    }, {})

    elements = reduced

    status = "ready";
    
  }
