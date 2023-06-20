import axios from "axios";

onmessage = event => {
  actions[event.data.type](event.data)
};

let status = "need credentials";
let url = null;
let models = null
let elements = null;
let psets = {};

const actions = {
  setup: data => {
    url = data.url;
    let token = `Bearer ${data.token}`;

    axios.interceptors.request.use(function (config) {
      (config.headers["Authorization"] = token),
        (config.headers["Content-Type"] = "application/json");
      return config;
    });
    status = "Ready";
  },
  status: (data) => {
    postMessage(status)
  },
  getData: () => {
    postMessage({type: "elements", data: elements});
    return;
  },
  refetch: async () => {
    status = "Fetching Models";
    postMessage({type: "status", status: status})
    models = await fetchModels();

    status = "Loading Elements";
    postMessage({type: "status", status: status})
    elements = await fetchSimpleElements();

    status = "Loading complete...";
    postMessage({type: "status", status: status})
    
    postMessage({type: "data", elements: elements, psets: psets});
    
    status = "Ready";
    postMessage({type: "status", status: status})
    return;
  }, 
  groupCount: (data) => {
    const {pset, property} = data
    status = "Grouping Elements...";
    postMessage({type: "status", status: status})
    let groupdata = groupCount(elements, pset, property)
    postMessage({type: "groupCount", groupdata: groupdata});

  },
};

async function fetchModels() {
  const data = await axios.get(url + "/model?type=IFC") //fetch only IFC
    .then(result => result.data.filter(item => item.status === 'C')) //only completed Models "status: 'C'"
  return data
}


async function fetchSimpleElements() {
  const data = await Promise.allSettled(
    models.map(model =>
      axios
        .get(url + `/model/${model.id}/element/simple`)
        .then(result => {
          status = `Loading ${model.name}`
          postMessage({type: "status", status: status})
          mergePsets(result.data)
          return [model.id, result.data]
        })
        .catch(e => console.error(`Loading Model with id "${id}" failed!`))
    )
  )
    .then(result => result.filter(item => item.status === "fulfilled"))
    .then(result => Object.fromEntries(result.map(item => item.value)));
    return data
  }


  function mergePsets(elem){
    let allElements = Object.values(elem).flat()
    for(const element of allElements){
      for(const [pset, attributes] of Object.entries(element)){       
        psets[pset] ?? (psets[pset] = [])
        psets[pset] = [...new Set([...psets[pset], ...Object.keys(attributes)])]
      }
    }
  }



  function groupCount(elements, keyPset, keyProperty){
    let data = {}
    //loop Models
    for (const [modelId, model] of Object.entries(elements)) {
        //loop Elements
        for (const [id, element] of Object.entries(model)) {
          if(element[keyPset] && element[keyPset][keyProperty]){ //if element does not have property, ignore
            let value = element[keyPset][keyProperty]
            //create groups
            data[value] ?? (data[value] = {})
            //loop Psets
            for(const [pset, properties] of Object.entries(element)){
              data[value][pset] ?? (data[value][pset] = {})
              //loop Properties
              for(const property of Object.keys(properties)){
                data[value][pset][property] ?? (data[value][pset][property] = [])
                data[value][pset][property].push(id)
              }
            }
          }
        }
      }
      return data
    }
