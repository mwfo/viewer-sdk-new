<template>
  <div v-if="isLoading" class="loading">
    <BIMDataLoading></BIMDataLoading>
  </div>
  <div v-else class="fvWrapper">
    <BIMDataToggle v-model="userCanEdit"><span>{{ userCanEdit ? 'admin' : 'user' }}</span></BIMDataToggle>
    <div class="header">
      Filterviews
      <div class="header-buttons">
        <BIMDataButton v-if="userCanEdit" width="3em" height="2em" color="primary" fill radius @click="handleEditorNew">
          <BIMDataIcon name="plus" fill color="silver" size="xxs" />
        </BIMDataButton>
        <BIMDataButton v-if="userCanEdit" width="3em" height="2em" color="primary" fill radius
          :disabled="!selectedFilterview || showEditor" @click="handleEditorToggle">
          <BIMDataIcon name="edit" fill color="silver" size="xxs" />
        </BIMDataButton>
        <BIMDataButton width="3em" height="2em" color="primary" fill radius :disabled="!selectedFilterview"
          @click="handleResetSelection">
          <BIMDataIcon name="reset" size="xxs" fill color="silver" />
        </BIMDataButton>
      </div>
    </div>

    <FilterviewList :filterviews="roleFilterviews" :selectedFilterview="selectedFilterview"
      @filterview-select="(event) => handleFilterviewSelect(event.guid)" />

    <FilterviewResults :filterviews="filterviews" :selectedFilterview="selectedFilterview"
      :elements="elements" :models="models" />

    <FilterviewEditor v-if="showEditor && userCanEdit" :elements="elements" :filterviews="filterviews"
      :selectedFilterview="selectedFilterview" @editor-action="handleEditorAction" @editor-closed="handleEditorClose" />

  </div>
</template>

<script>
import axios from "axios";
import FilterviewList from "./FilterviewList.vue";
import FilterviewEditor from "./FilterviewEditor.vue";
import FilterviewResults from "./FilterviewResults.vue";

export default {
  name: "FilterviewPlugin",
  components: { FilterviewList, FilterviewEditor, FilterviewResults },
  data() {
    return {
      isLoading: true,
      showEditor: false,
      selectedFilterview: null,
      elements: {},
      filterviews: [],
      userRole: null,

      //test
      userCanEdit: false,
    };
  },
  computed: {
    userCanEditProd() {
      return this.userRole.has_admin_permission
    },
    roleFilterviews(){
      if(this.userCanEdit){
        return this.filterviews
      } else {
        return this.filterviews.filter(item => item.labels.includes('public'))
      }
    }
  },
  methods: {


    handleFilterviewSelect(guid) {
      this.selectedFilterview = guid;
    },
    handleResetSelection() {
      this.selectedFilterview = null
    },
    async handleEditorAction(event) {
      switch (event.type) {
        case "create":
          let data = await this.createFilterview(event.content)
          this.filterviews = await this.fetchFilterviews() //update filterview List
          this.selectedFilterview = data.guid
          break;
        case "delete":
          this.handleEditorClose()
          this.selectedFilterview = null
          await this.deleteFilterview(event.guid)
          this.filterviews = await this.fetchFilterviews() //update filterview List
          break;
        case "save":
        await this.updateFilterview(event.guid, event.content)
        this.selectedFilterview = null
        this.filterviews = await this.fetchFilterviews() //update filterview List
        this.selectedFilterview = event.guid
        break;
      }
    },
    handleEditorNew() {
      this.selectedFilterview = null
      this.handleEditorToggle();
    },
    handleEditorToggle() {
      this.showEditor = !this.show;
    },
    handleEditorClose() {
      this.showEditor = false;
    },

    // FETCH FUNCTIONS

    async fetchUserRole() {
      const data = await axios.get(this.cloudUrl + "/check-access")
        .then((response) => response.data);
      return data
    },
    async fetchFilterviews() {
      const data = await axios.get(this.bcfUrl + `/topics?format=filterview`)
        .then(result => result.data);
      return data
    },
    async deleteFilterview(guid) {
      const data = await axios.delete(this.bcfUrl + `/topics/${guid}?format=filterview`)
        .then(result => result.data)
      return data
    },
    async createFilterview(content) {
      const data = await axios.post(this.bcfUrl + '/topics', { ...content, format: "filterview" }) //adding type: "filterview" to content
        .then(response => response.data)
      return data
    },
    async updateFilterview(guid, content) {
      const data = await axios.patch(this.bcfUrl + `/topics/${guid}?format=filterview`, content)
        .then(result => result.data)
      return data
    },
    async fetchModels() {
      const data = await axios.get(this.cloudUrl + "/model?type=IFC") //only IFC
        .then(result => result.data.filter(item => item.status === 'C')) //only completed Models "status: 'C'"
      return data
    },
    async fetchSimpleElements() {
      const modelIds = this.models.map(item => item.id);
      const data = await Promise.allSettled(
        modelIds.map((id) =>
          axios.get(this.cloudUrl + `/model/${id}/element/simple`)
            .then(result => [id, result.data])
            .catch((e) => console.error(`Loading Model with id "${id}" failed!`))
        )
      )
        .then(result => result.filter(item => item.status === "fulfilled"))
        .then(result => Object.fromEntries(result.map(item => item.value)))
      return data
    },
  },

  //LIFECYCLE

  async mounted() {
    this.userRole = await this.fetchUserRole()
    this.models = await this.fetchModels()
    this.elements = await this.fetchSimpleElements()
    this.filterviews = await this.fetchFilterviews()
    this.isLoading = false
  },
  created() {

    
    this.cloudUrl = `${this.$viewer.api.apiUrl}/cloud/${this.$viewer.api.cloudId}/project/${this.$viewer.api.projectId}`
    this.bcfUrl = `${this.$viewer.api.apiUrl}/bcf/2.1/projects/${this.$viewer.api.projectId}`

    //create Axios Interceptor
    const token = `Bearer ${this.$viewer.api.accessToken}`
    axios.interceptors.request.use(function (config) {
      config.headers['Authorization'] = token,
        config.headers['Content-Type'] = "application/json"
      return config
    })
  },
};
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5em;
  font-size: 2em;
  font-weight: bold;
  border-bottom: 1px solid #aaaaaa;

  &-buttons {
    display: flex;
    flex-direction: row;

    & button {
      margin-left: 1em;
    }
  }
}

.fvWrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: scroll;
  padding: 1em;

  &::-webkit-scrollbar-track {
    background: #ffffff;
  }
}

.fvResult {
  display: flex;
  flex-direction: column;
  padding: 1em;
  line-height: 1.5em;

  &-table {
    display: grid;
    height: 100%;
    grid-template-columns: 1fr 5em;
  }

  &-item {
    cursor: pointer;

    &.selected {
      font-weight: bold;
    }
  }

  &-item:hover {
    color: #434e69;
    font-weight: bold;
    background: #d8d8d8;
  }
}
</style>
