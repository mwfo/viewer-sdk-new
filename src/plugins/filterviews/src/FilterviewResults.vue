<template>
    <div v-if="showResult" class="fvList">
        <h2>Results</h2>
        <ul>
            <li v-for="(item, name, index) in filterviewResult.autocolored" :key="index"
                :class="{ selected: selectedResult.includes(name) }" @click="(event) =>handleSelectResult(name, event)">
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
import useActions from './composables/useActions';

export default {
    setup() {
        const { favorites } = useFavorites()
        const { operators } = useOperators()
        const { filterElements } = useActions()

        return { favorites, operators, filterElements }
    },
    props: ["elements", "filterviews", "selectedFilterview", "models"],
    data() {
        return {
            selectedResult: [],
            filterviewResult: {
                visible: [],
                color: [],
                transparend: [],
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
                this.filterviewResult = this.filterElements(this.elements, this.models, this.rows)
                this.showFilterviewResult()
            } else {
                this.filterviewResult = { visible: [], color: [], autocolored: {} }
                this.resetView()
            }
        },
    },
    methods: {
        handleSelectResult(name, event) {
            if(event.ctrlKey){
                if(this.selectedResult.includes(name)){
                    this.selectedResult = this.selectedResult.filter(item => item !== name); 
                } else {
                    this.selectedResult.push(name); 
                }
            } else {
                if(this.selectedResult.length > 1 || !this.selectedResult.includes(name)){
                    this.selectedResult = [name]
                } else {
                    this.selectedResult = []
                }
            }

            if(this.selectedResult.length === 0){
                this.showFilterviewResult();
            } else {
                this.showAndColorSelectedResults()
            }
        },
        resetView(hide=false) {
            let ids = this.$viewer.state.objects.map((item) => item.id)
            this.$viewer.state.colorizeObjects(ids, "#aaaaaa"); //uncolor all Objects
            this.$viewer.state.unxrayObjects(ids) //remove Transparency
            //show all Objects
            if(!hide){
                this.$viewer.state.showObjects(ids)
            } else {
                this.$viewer.state.hideObjects(ids)
            }
        },
        showFilterviewResult() {
            this.resetView(true)
            
            //show selected ids
            this.$viewer.state.showObjectsByUuids(this.filterviewResult.visible);

            //make selected ids transparent
            this.$viewer.state.xrayObjectsByUuids(this.filterviewResult.transparent)

            //color Ids in order if Rows
            for (const { color, ids } of Object.values(this.filterviewResult.colored)) {
                this.$viewer.state.colorizeObjectsByUuids(ids, color);
            }

            //autocolored Elements, always last action, will overwrite all other colors
            for (const { color, ids } of Object.values(this.filterviewResult.autocolored)) {
                this.$viewer.state.colorizeObjectsByUuids(ids, color);
            }
        },
        //should be merged with showFilterview...
        showAndColorSelectedResults() {
            let results = Object.entries(this.filterviewResult.autocolored).filter(([key, value]) => this.selectedResult.includes(key)).map(([key, value]) => value)
            //hide all Objects
            this.$viewer.state.hideObjects(this.$viewer.state.objects.map((item) => item.id));
            console.log(results)
            for (const {color, ids} of results){
                //show selected ids
                this.$viewer.state.showObjectsByUuids(ids);
                //color elements
                this.$viewer.state.colorizeObjectsByUuids(ids, color);
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
  