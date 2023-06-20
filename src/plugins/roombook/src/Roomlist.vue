<template>
    <div>
        <nav>Navigation: 
            <button @click="test">GroupByElements</button>
        </nav>
        <div class="table" :style="cssGrid">

        <!-- Grouped Header -->
                <div class="table-header"  :key="keyPset">
                    {{ keypset }}
                </div>

            <template  v-for="(properties, pset) in table.columns">
                <div class="table-header"  :key="pset" :style="{'grid-column': `span ${properties.length}`}">
                    {{ pset }}
                </div>
            </template>
<!--             <div class="table-header"  :key="keyProperty">
                    {{ keyProperty }}
            </div>


            <template  v-for="(properties, pset) in table.columns">
                <div v-for="property in properties" class="table-header"  :key="pset + property">
                    {{ property }}
                </div>
            </template> -->

        <!-- Content  -->
            <template v-for="(groupData, group) in data">
                <div :key="groupData+group">{{ group }}</div>
                <template  v-for="(properties, pset) in table.columns">
                    <template  v-for="property in properties">
                        <div :key="pset + '.' + property">
                            {{ groupData[pset] && groupData[pset][property] ? groupData[pset][property].length : 0}}
                        </div>

                    </template>            
            </template>
        </template>

    <!--             <div class="table-header" v-for="property in properties" :key="properties">
                    {{ property }}
                </div> -->
            

<!--             <template v-for="(groupKey, groupData) in data">
                <div class="table-cell" 
                :key="groupKey">
                {{ groupKey }}
                </div>
                <div v-for="pset in groupData" :key="pset">{{ pset }}</div> -->


  <!--               <div class="table-cell" 
                v-for="(value, colIndex) in row" 
                :key="rowIndex + '-' + colIndex"
                @click="handleSelect(rowIndex, colIndex)">
                    {{ value }}
                </div>
            </template> -->
        </div>
    </div>
</template>

<script>

export default {
    props: ["data"],
    data() {
        return {
            table: {
                keyPset: "attributes",
                keyProperty: "type",
                columns:{
                    attributes: ["type", "Name", "test"],
                    Pset_ColumnCommon: ["IsExternal", "LoadBearing"]
                }
            }
        }
    },
    computed: {
/*         gridColumns(){
            Object.entries(data).map([pset, properties] => {})

        } */
    },
    methods: {
        test(){
            console.log("DATA", this.data)
        }
    },
    mounted(){
        console.log(this.data)
    }


/*         handleSelect(rowIndex, colIndex){
            let column = this.data.$columns[colIndex]
            let grpCol = this.data.$columns[0]
            let grpVal = this.data.$dataIncolumnFormat[0][rowIndex]

        

        let col = this.df.query(this.df[grpCol].eq(grpVal)).column("elementId")
        
            //hide all objects
            this.$viewer.state.hideObjects(this.$viewer.state.objects.map((item) => item.id));
            //show selected
            this.$viewer.state.showObjectsByUuids(col.$data)

        }, 
        handleGroup() {
            let key = "attributes.type"

            //selected Columns, 0-9 for testing
            let selectedColumns = this.df.columns
            let mapDf = this.df //.loc({columns: selectedColumns})
            let grp = mapDf.groupby([key]).count({axis: 0})
            grp.print()
            this.data = grp
      */
       

/* 
            .applyMap(item => item === undefined ? 0 : 1)
       /*      .addColumn(keyCol.columns[0], [...keyCol.$data]) */
 
   

/* 
            let grp = mapDf.groupby([key]).sum({axis: 0})
            grp.print() */

     

/*             
            let keyCol = this.df.column(key)
            let mapDf = this.df.drop({columns: [key]})


   /*          let mapDf = this.df.drop([key]).applyMap(item => item === undefined ? 0 : 1) */
            /* console.log(keyCol) */

   /*          let grp = this.df.groupby({columns: [key]})
            console.log(grp)

            this.data = grp.count({axis: 0})
            console.log(this.data) */
/*         },
        handleColumns() {
            let grp = this.df.loc({columns: ["elementId", "modelId", "attributes.type"]})
            this.data = grp
            console.log(this.data)
        }

    },
    computed: {
        cssGrid() {
            return {
                "grid-template-columns": `repeat(${this.data.shape[1]}, 1fr)`
            }
        }
    },
    async mounted() {
        let elements = await this.fetchSimpleElements()
        this.df = new DataFrame(this.reduceSimpleElements(elements), {config: { lowMemoryMode: true }})
        this.mounted = true
    } */
}


</script>

<style lang="scss" scoped>
.table {
    display: grid;
    background: red;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1ft;
    height: 100%;
    width: 100%;
}

.table-header {
    font-weight: bold;
    white-space: nowrap;
    padding: 0.5em;
}

.table-cell {
    padding: 0.5em;
    border: 1px solid black;
    white-space: nowrap;

    &:hover {
        background: #ddd
    }
}
</style>