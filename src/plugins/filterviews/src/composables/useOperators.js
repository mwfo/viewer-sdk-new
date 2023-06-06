import { ref } from "vue";

//returns a Regexp keeping * and ? wildcards provided in the input String
function regexWithWildcards(input) {
  return new RegExp(
    input.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/[*?]/g, ".$&"),
    "i"
  );
}

export default function () {
  const operators = {
    equals: {
      valueInput: true,
      evaluate: function (rowValue, elementValue) {
        rowValue = rowValue ? rowValue.toLowerCase() : "";
        elementValue = elementValue ? elementValue.toLowerCase() : "";
        return rowValue == elementValue;
      },
    },
    defined: {
      valueInput: false,
      evaluate: function () {
        return true;
      },
    },
    contains: {
      valueInput: true,
      evaluate: function (rowValue, elementValue) {
        let regex = regexWithWildcards(rowValue);
        return regex.test(elementValue);
      },
    },
    in: {
      valueInput: true,
      evaluate: function (rowValue, elementValue) {
        let regex = regexWithWildcards(elementValue);
        return regex.test(rowValue);
      },
    },
    //default
    null: {
      valueInput: false,
      evaluate: function () {
      return true;
      },
    },
  };
  return { operators };
}
