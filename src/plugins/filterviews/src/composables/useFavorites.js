import { ref } from "vue";

export default function () {
  const favorites = ref({
    Summary: {
      Model: { pset: "", property: "Model" },
      Name: { pset: "attributes", property: "Name" },
      type: { pset: "attributes", property: "type" },
      tag: { pset: "attributes", property: "tag" },
      IsExternal: { pset: "Pset_${Element}Common", property: "IsExternal" },
      LoadBearing: { pset: "Pset_${Element}Common", property: "LoadBearing" },
      FireRating: { pset: "Pset_${Element}Common", property: "FireRating" },
    }

  });
  return { favorites };
}
