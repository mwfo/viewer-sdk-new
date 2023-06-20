import { ref } from "vue";
import { DataFrame } from "danfojs";

const df = ref(new DataFrame())

function reduceSimpleElements(simpleElements) {


    //danfojs does not handle sparse data well. Extracting Pset.Attributes to use as default for reducer
    let uniqueColumns = Object.values(simpleElements).map(model => 
        Object.fromEntries([...new Set(Object.values(model).map(elements => 
            Object.entries(elements).map(([pset, properties]) => 
                Object.keys(properties).map(property => `${pset}.${property}`)
            )
        ).flat(2))].map(item => [item, NaN]))
    )


  let data = Object.entries(simpleElements).map(([modelId, elements]) =>
    Object.entries(elements).map(([elementId, psets]) =>
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
          { modelId: modelId, elementId: elementId, ...uniqueColumns[0] }
        )
    )
  );
  return data[0];
}

export default function () {


  return { reduceSimpleElements, df };
}
