<template>
  <div class="editor">
        <div class="editor-header">
<!--       <BIMDataInput class="editor-header-title" v-model="title" margin="0px 0px" /> -->
      <DatalistInput 
        :key="title"
        class="editor-header-title" 
        :type="text"
        v-model="title" />


      <div class="editor-header-buttons">
        <BIMDataToggle v-model="isPublic">
          <span>{{ isPublic ? 'Geteilt' : 'Lokal' }}</span>
        </BIMDataToggle>
        <BIMDataButton width="3em" height="2em" :color="hasChanged ? 'secondary' : 'primary'" fill radius
          @click="handleSave">
          <BIMDataIcon name="save" size="xxs" fill color="default" />
        </BIMDataButton>
        <BIMDataButton width="3em" height="2em" color="high" fill radius @click="handleDelete">
          <BIMDataIcon name="delete" size="xxs" fill color="default" />
        </BIMDataButton>
        <BIMDataButton width="3em" height="2em" color="primary" fill radius @click="handleDuplicate">
          Duplicate
        </BIMDataButton>

        <div class="editor-close" @click="handleClose">
          <BIMDataIcon name="close" fill color="default" />
        </div>
      </div>
    </div>
    <div class="editor-table">
      <div class="editor-table-item title">{{ $t("FilterviewsPlugin.elementType") }}</div>
      <div class="editor-table-item title">{{ $t("FilterviewsPlugin.pset") }}</div>
      <div class="editor-table-item title">{{ $t("FilterviewsPlugin.property") }}</div>
      <div class="editor-table-item title">{{ $t("FilterviewsPlugin.operator") }}</div>
      <div class="editor-table-item title">{{ $t("FilterviewsPlugin.value") }}</div>
      <div class="editor-table-item title">{{ $t("FilterviewsPlugin.action") }}</div>
      <div class="editor-table-item title"></div>
      <div class="editor-table-item title"></div>
      
      
      <template v-for="(item, index) in rows">

        <DatalistInput 
        class="editor-table-item" 
        :key="index + '-element' + refreshInput"
        v-model="rows[index].element" 
        :options="elementOptions" />
      

        <DatalistInput 
        class="editor-table-item" 
        :key="index + '-pset' + refreshInput" 
        v-model.lazy="rows[index].pset"
        :options="psetOptions" />

        <DatalistInput 
        class="editor-table-item" 
        :key="index + '-property' + refreshInput"
        v-model="rows[index].property"
        :options="getPropertyOptions(index)"
        :disabled="isPropertyInputDisabled(index)" />

        <DatalistSelect
        class="editor-table-item" 
        :key="index + '-operator' + refreshInput"
        v-model="rows[index].operator"
        :options="operators"
        :useKey="true" 
        :disabled="isOperatorInputDisabled(index)" />

          <DatalistInput 
        class="editor-table-item" 
        :dropdown="false"
        :key="index + '-value' + refreshInput"
        v-model="rows[index].value"
        :disabled="isValueInputDisabled(index)" />

        <DatalistSelect
        class="editor-table-item" 
        :key="index + '-action' + refreshInput"
        v-model="rows[index].action"
        :options="actions"
        :useKey="true"
        />
        
        <input type="color" v-if="isColorDisabled(index)" disabled value="#aaaaaa" class="editor-table-item"
          :key="index + '-disabled-color' + refreshInput">
        <input type="color" v-else class="editor-table-item" :key="index + '-color'" v-model="rows[index].color" />

        <BIMDataDropdownMenu :key="index + 'menu'" width="100%" :disabled="false" directionClass="down">
          <template #header>
            <BIMDataIcon name="burgerMenu" fill color="default" size="m" />
          </template>
          <template #element>
            <ul class="bimdata-list">
              <li v-for="element of ['Move up', 'Remove', 'Duplicate', 'Move down']" :key="element" :data-rowid="index"
                @click="handleRowMenu">{{ element }}</li>
            </ul>
          </template>
        </BIMDataDropdownMenu>
      </template>
      <BIMDataButton class="buttonAdd" width="100%" color="default" outline square @click="addEditorRow"><span
          style="font-size: 2em; font-weight: bold">＋</span></BIMDataButton>
    </div>
  </div>
</template>

<script>
import useFavorites from './composables/useFavorites';
import useOperators from './composables/useOperators';
import useActions from './composables/useActions';

import DatalistInput from './DatalistInput.vue';
import DatalistSelect from './DatalistSelect.vue';

export default {
  setup(){
    const {favorites} = useFavorites()
    const {operators} = useOperators()
    const { actions } = useActions()
    return {favorites, operators, actions}
  },
  components: {DatalistInput, DatalistSelect},
  props: ["elements", "selectedFilterview", "filterviews"],
  data() {
    return {
      rows: [],
      prevRows: [],
      title: "New Filterview",
      isPublic: false,
      isNew: false,
      editor: {
        actions: ["add", "remove", "color", "autocolor"],
      },
      refreshInput: 0,
    }
  },
  computed: {
    uniqueProperties() {
      let allElements = Object.values(this.elements).map(elem => Object.values(elem)).flat()
      let data = {}
      data = Object.values(allElements).reduce((result, current) => {
        for(const [key, value] of Object.entries(current)){
            result[key] ?? (result[key] = [])
            result[key] = [...new Set([...result[key], ...Object.keys(value)])]
          }
        return result
      }, {})
      return data
    },
    labels() {
      return this.isPublic ? ['public'] : ['private']
    },
    hasChanged() {
      return JSON.stringify(this.rows) != this.prevRows
    },
    psetOptions(){
      return this.getPsetOptions()
    },
    elementOptions(){
      let allElements = [...new Set(Object.values(this.elements).map(elem => Object.values(elem)).flat().map(item => item.attributes.type))]
      //Should be defined in composable...
      let exclude = ["IfcSystem", "IfcSite", "IfcBuildingStorey", "IfcBuilding", "IfcProject"]
      return allElements.filter(item => !exclude.includes(item)).toSorted((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    }
  },
  watch: {
    selectedFilterview() {     
      if (this.selectedFilterview) {
        this.loadFilterview()
      } else {
        this.resetFilterview()
      }
    },
    filterviews(){
      if (this.selectedFilterview) {
        this.loadFilterview()
      } else {
        this.resetFilterview()
      }
    },
  },
  methods: {
    addEditorRow() {
      this.rows.push({ element: null, pset: null, property: null, value: null, operator: null, color: "#ff0000", action: "add" })
    },
    async handleSave() {
      let data = {
        type: this.isNew ? "create" : "save",
        guid: this.isNew ? null : this.selectedFilterview,
        content: {
          title: this.title,
          labels: this.labels,
          description: JSON.stringify(this.rows)
        }
      }
      this.$emit("editor-action", data)
    },
    handleDelete() {
      if (this.selectedFilterview) {
        this.$emit("editor-action", {type: "delete", guid: this.selectedFilterview})
      }
    },
    loadFilterview() {
      let {title, labels, description} = this.filterviews.filter(item => item.guid == this.selectedFilterview)[0]
      this.title = title
      this.isPublic = labels.includes("public")
      this.rows = JSON.parse(description)
      this.prevRows = description
      this.isNew = false
      this.refreshInput++
    },
    resetFilterview() {
      this.title = 'New Filterview'
      this.rows = []
      this.prevRows = []
      this.isNew = true
      this.addEditorRow()
    },
    handleDuplicate() {
      this.title = `${this.title} Copy`
      this.isNew = true
    },
    handleClose() {
      this.$emit('editor-closed')
    },
    getPsetOptions(rowIndex) {
      let options =  [...Object.keys(this.favorites), ...Object.keys(this.uniqueProperties).toSorted((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))]
      return options
    },
    getPropertyOptions(rowIndex) {
      let pset = this.rows[rowIndex].pset
      let options = []
      if(pset in this.favorites){
        options = Object.values(this.favorites[pset]).map(item => item.property)
      } else if(pset) {
        options = this.uniqueProperties[pset]
      }
      if(options){
        return  options.toSorted((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      } else {
        return []
      }
    },
    getOperatorOptions(rowIndex) {
      return this.editor.operators
    },
    isOperatorInputDisabled(rowIndex){
      if(!this.rows[rowIndex].property){
        this.rows[rowIndex].operator = null
        return true
      }
    },
    isPropertyInputDisabled(rowIndex){
      if(!this.rows[rowIndex].pset){
        this.rows[rowIndex].property = null
        return true
      }
    },
    isValueInputDisabled(rowIndex) {
      return !this.operators[this.rows[rowIndex].operator].valueInput
    },
    isColorDisabled(rowIndex) {
      let validActions = ['color']
      let isValidAction = validActions.includes(this.rows[rowIndex].action)
      return !isValidAction
    },
    handleRowMenu(event) {
      let index = event.target.dataset.rowid
      let action = event.target.innerText
      switch (action) {
        case "Move up":
          if (index > 0) {
            this.rows[index] = this.rows.splice(index - 1, 1, this.rows[index])[0]
            this.refreshInput++
          }
          break;
        case "Move down":
          if (this.rows.length - 1 > index) {
            index++
            this.rows[index] = this.rows.splice(index - 1, 1, this.rows[index])[0]
            this.refreshInput++
          }
          break;
        case "Duplicate":
          let copyRow = {... this.rows[index]}
          this.rows = this.rows.toSpliced(index, 0, {...this.rows[index]})
          this.refreshInput++
          break;
        case "Remove":
          this.rows.splice(index, 1)
          if (this.rows.length === 0) {
            this.addEditorRow()
          }
          this.refreshInput++
          break;
      }
    },
  },
  mounted() {
    if (this.selectedFilterview) {
      this.loadFilterview()
    } else {
      this.resetFilterview()
    }
  },
}
</script>

<style lang="scss"  scoped>



.editor {
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 0;
  left: 100%;
  margin-left: 1em;
  width: 65em;
  height: 25em;
  background: white;
  box-shadow: #00000022 0 2px 10px 0;
  padding: 1em;
  overflow-y: scroll;

  &::-webkit-scrollbar-track {
    background: #ffffff;
  }

  & h2 {
    margin: 0;
  }

  &-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-content: start;
    margin-bottom: 1em;
  }

  &-header-title {
    font-size: 1.5em;
    font-weight: bold;
    width: 50%;
    min-width: 6em;
  }

  &-header-buttons {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;

    &>button {
      margin: 0 0.5em 0 0.5em;
    }
  }

  &-close {
    margin-left: 2em;
    height: min-content;
    cursor: pointer;
  }

  &-table {
    height: min-content;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(6, 1fr) 3em 5em;
    grid-template-rows: auto;
    column-gap: 0.25em;
    align-items: center;
    text-overflow: ellipsis;

    &-item {
      width: 100%;
    }

    &-item.title {
      font-weight: bold;
    }

    .buttonAdd {
      grid-column: 1 / 9;
      margin-top: 0.25em
    }
  }

  .bimdata-select{
    text-overflow: ellipsis;
    white-space: nowrap;

  }
}

</style>