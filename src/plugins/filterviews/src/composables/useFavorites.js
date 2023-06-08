import { ref } from "vue";

function getCommonPset(elementType) {
  //Ifc exceptions, where PsetCommon is not matching Type
  if (elementType === "IfcWallStandardCase") {
    elementType = "IfcWall";
  }
  //extract Element from IfcElement
  return `Pset_${elementType.slice(3)}Common`;
}

export default function () {
  const favorites = {
    Summary: {
      Model: { pset: "", property: "Model" },
      Name: { pset: () => "attributes", property: "Name" },
      type: { pset: () => "attributes", property: "type" },
      tag: { pset: () => "attributes", property: "tag" },
      IsExternal: { pset: getCommonPset, property: "IsExternal" },
      LoadBearing: { pset: getCommonPset, property: "LoadBearing" },
      FireRating: { pset: getCommonPset, property: "FireRating" },
    },
  };
  return { favorites };
}
