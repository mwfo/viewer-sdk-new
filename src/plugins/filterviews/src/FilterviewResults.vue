<template>
    <div v-if="showResult" class="fvList">
        <h2>Results</h2>
        <ul>
            <li v-for="(item, name, index) in filterviewResult.autocolored" :key="index"
                :class="{ selected: selectedResult === name }" @click="handleSelectResult(name)">
                <span class="title">{{ name }}</span>
                <div class="color" :style="{ background: item.color }">
                    {{ item.ids.length }}
                </div>
            </li>
        </ul>
    </div>
</template>
  
<script>
import useFavorites from './composables/useFavorites';
import useOperators from './composables/useOperators';
export default {
    setup() {
        const { favorites } = useFavorites()
        const { operators } = useOperators()
        console.log("initial", favorites)
        return { favorites, operators }
    },
    props: ["elements", "filterviews", "selectedFilterview", "models"],
    data() {
        return {
            selectedResult: null,
            filterviewResult: {
                visible: [],
                color: [],
                autocolored: {},
            },
            refreshkey: 0
        }
    },
    computed: {
        showResult() {
            return Object.keys(this.filterviewResult.autocolored).length !== 0
        },
        rows() {
            this.refreshkey
            return JSON.parse(this.filterviews.filter(item => item.guid == this.selectedFilterview)[0].description)
        }
    },
    watch: {
        selectedFilterview() {
            if (this.selectedFilterview) {
                this.filterviewResult = this.filterElements(this.selectedFilterview)
                this.showFilterviewResult()
            } else {
                this.filterviewResult = { visible: [], color: [], autocolored: {} }
                this.resetView()
            }
        },
    },
    methods: {
        handleSelectResult(name) {
            if (this.selectedResult === name) {
                this.selectedResult = null;
                this.showFilterviewResult();
            } else {
                this.selectedResult = name;
                const ids = this.filterviewResult.autocolored[name].ids;
                const color = this.filterviewResult.autocolored[name].color;
                this.showAndColorElements(ids, color);
            }
        },
        resetView() {
            //uncolor all Objects
            this.$viewer.state.colorizeObjects(
                this.$viewer.state.objects.map((item) => item.id), "#aaaaaa"
            );
            //show all Objects
            this.$viewer.state.showObjects(this.$viewer.state.objects.map((item) => item.id));
        },
        showFilterviewResult() {
            //uncolor all Objects
            this.$viewer.state.colorizeObjects(
                this.$viewer.state.objects.map((item) => item.id),
                "#aaaaaa"
            );
            //hide all Objects
            this.$viewer.state.hideObjects(this.$viewer.state.objects.map((item) => item.id));
            //show selected ids
            this.$viewer.state.showObjectsByUuids(this.filterviewResult.visible);
            //color Ids in order if Rows
            for (const { color, ids } of Object.values(this.filterviewResult.colored)) {
                this.$viewer.state.colorizeObjectsByUuids(ids, color);
            }
            //autocolored Elements, always last action, will overwrite all other colors
            for (const { color, ids } of Object.values(this.filterviewResult.autocolored)) {
                this.$viewer.state.colorizeObjectsByUuids(ids, color);
            }
        },
        showAndColorElements(ids, color = "#aaaaaa") {
            //hide all Objects
            this.$viewer.state.hideObjects(this.$viewer.state.objects.map((item) => item.id));
            //show selected ids
            this.$viewer.state.showObjectsByUuids(ids);
            //color elements
            this.$viewer.state.colorizeObjectsByUuids(ids, color);
        },
        getCommonPset(element) {
            let type = element.attributes.type
            let exceptions = {
                "IfcWallStandardCase": "IfcWall"
            }
            if (exceptions[type]) {
                type = exceptions[type]
            }
            return `Pset_${type.slice(3)}Common`
        },
        isValidElement(element, row) {
            //See also Filterview Editor. Exceptions should defined in composable
            let exclude = ["IfcSystem", "IfcSite", "IfcBuildingStorey", "IfcBuilding", "IfcProject"]
            if (exclude.includes(element.attributes.type)) {
                return false
            } else {
                return row.element == null || row.element == "" || row.element == element.attributes.type;
            }
        },
        isValidModel(modelId, row) {
            let { pset, property } = row
            if (pset in this.favorites && property == 'Model') {
                let value = this.models.filter(item => item.id == modelId)[0].name
                return this.operators[row.operator].evaluate(row.value, value)            }
            return true
        },
        isValidProperty(element, row) {
            let { pset, property } = row
            if (pset && property) {

                //WIP, prototype
                //Replace favorites with Pset and Attributes defined in useFavorites Composable
                //Function should be in composable, with getPset callback               

                if (pset in this.favorites && property === 'Model') { //Model will be handled in ValidElements                   
                    return true
                } else if (pset in this.favorites) { //If not Model, replace pset with "PsetElementCommon"
                    let replaceType = element.attributes.type.slice(3)

                    //Ifc exceptions, where PsetCommon is not matching Type
                    if (replaceType === "WallStandardCase") {
                        replaceType = "Wall"
                    }
                    property = this.favorites[pset][property]?.property
                    pset = this.favorites[pset][property]?.pset.replace("${Element}", replaceType)

                }
                //END WIP

                let hasProperty = pset in element ? property in element[pset] : false
                if (hasProperty) {
                    let value = element[pset][property]
                    return this.operators[row.operator].evaluate(row.value, value)
                }
            } else {
                return true
            }
        },
        filterElements(guid) {
            const allElements = this.elements; //this point could be used to pre-filter by models considering ALL adds ++performance?
            let visible = [];
            let colored = [];
            let autocolored = {};

            for (const [modelId, model] of Object.entries(allElements)) {
                for (const [id, element] of Object.entries(model)) {
                    let isSelected = false;
                    for (const [index, row] of this.rows.entries()) {
                        if (this.isValidModel(modelId, row) && this.isValidElement(element, row) && this.isValidProperty(element, row)) {
                            switch (row.action) {
                                case "Add":
                                    isSelected = true;
                                    break;
                                case "Remove":
                                    isSelected = false;
                                    break;
                                case "Color":
                                    if (isSelected) {
                                        colored[index] = colored[index] || { color: row.color, ids: [] };
                                        colored[index].ids.push(id);
                                    }
                                    break;
                                case "Autocolor":
                                    if (isSelected) {
                                        //also check if Attribute is defined in row
                                        if (row.pset && row.property) {
                                            let value = element[row.pset][row.property];
                                            autocolored[value] = autocolored[value] || { color: null, ids: [] };
                                            autocolored[value].ids.push(id);
                                        }
                                        break;
                                    }
                            }
                        }
                        isSelected && visible.push(id);
                    }
                }
            }

            //Sort and Color Autocolored Elements, colorList has 254 disctinct colors with high contrast
            let colorList = ["#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059", "#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87", "#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80", "#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100", "#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F", "#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09", "#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66", "#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C", "#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81", "#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00", "#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700", "#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329", "#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98", "#A4E804", "#324E72", "#6A3A4C", "#83AB58", "#001C1E", "#D1F7CE", "#004B28", "#C8D0F6", "#A3A489", "#806C66", "#222800", "#BF5650", "#E83000", "#66796D", "#DA007C", "#FF1A59", "#8ADBB4", "#1E0200", "#5B4E51", "#C895C5", "#320033", "#FF6832", "#66E1D3", "#CFCDAC", "#D0AC94", "#7ED379", "#012C58", "#7A7BFF", "#D68E01", "#353339", "#78AFA1", "#FEB2C6", "#75797C", "#837393", "#943A4D", "#B5F4FF", "#D2DCD5", "#9556BD", "#6A714A", "#001325", "#02525F", "#0AA3F7", "#E98176", "#DBD5DD", "#5EBCD1", "#3D4F44", "#7E6405", "#02684E", "#962B75", "#8D8546", "#9695C5", "#E773CE", "#D86A78", "#3E89BE", "#CA834E", "#518A87", "#5B113C", "#55813B", "#E704C4", "#00005F", "#A97399", "#4B8160", "#59738A", "#FF5DA7", "#F7C9BF", "#643127", "#513A01", "#6B94AA", "#51A058", "#A45B02", "#1D1702", "#E20027", "#E7AB63", "#4C6001", "#9C6966", "#64547B", "#97979E", "#006A66", "#391406", "#F4D749", "#0045D2", "#006C31", "#DDB6D0", "#7C6571", "#9FB2A4", "#00D891", "#15A08A", "#BC65E9", "#C6DC99", "#203B3C", "#671190", "#6B3A64", "#F5E1FF", "#FFA0F2", "#CCAA35", "#374527", "#8BB400", "#797868", "#C6005A", "#3B000A", "#C86240", "#29607C", "#402334", "#7D5A44", "#CCB87C", "#B88183", "#AA5199", "#B5D6C3", "#A38469", "#9F94F0", "#A74571", "#B894A6", "#71BB8C", "#00B433", "#789EC9", "#6D80BA", "#953F00", "#5EFF03", "#E4FFFC", "#1BE177", "#BCB1E5", "#76912F", "#003109", "#0060CD", "#D20096", "#895563", "#29201D", "#5B3213", "#A76F42", "#89412E", "#1A3A2A", "#494B5A", "#A88C85", "#F4ABAA", "#A3F3AB", "#00C6C8", "#EA8B66", "#958A9F", "#BDC9D2", "#9FA064", "#BE4700", "#658188", "#83A485", "#453C23", "#47675D", "#3A3F00", "#061203", "#DFFB71", "#868E7E", "#98D058", "#6C8F7D", "#D7BFC2", "#3C3E6E", "#D83D66", "#2F5D9B", "#6C5E46", "#D25B88", "#5B656C", "#00B57F", "#545C46", "#866097", "#365D25", "#252F99", "#00CCFF", "#674E60", "#FC009C", "#92896B"]
            let sortedEntries = Object.entries(autocolored).toSorted(([a,], [b,]) => a.toLowerCase().localeCompare(b.toLowerCase())) //sort by value
            autocolored = Object.fromEntries(sortedEntries.map((entry, index) => [entry[0], { ...entry[1], color: colorList[index % (colorList.length - 1)] }])) //color by sorted index

            return {
                visible: visible,
                colored: colored,
                autocolored: autocolored
            }
        },
    },
};
</script>
  
<style lang="scss" scoped>
details {
    border-bottom: 1px solid #aaaaaa;
    padding: 1em 0 1em 0;
}

summary {
    font-size: 1.5em;
    font-weight: bold;
}

ul {
    margin: 0;
    padding: 0;
}

li {
    cursor: pointer;
    list-style: none;
    display: flex;
    flex-direction: row;
    padding-left: 1.5em;
    line-height: 2em;

    &.selected {
        font-weight: bold;
    }

    &:hover {
        font-weight: bold;
        background: #d8d8d8;
    }
}

.title {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.color {
    width: 6em;
    text-align: right;
    padding-right: 0.5em;
}
</style>
  