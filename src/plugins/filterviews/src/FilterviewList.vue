<template>
  <div class="fvList">
    <details open v-for="(values, label) in filterviewsByLabels" :key="label">
      <summary>
        {{ label }} <i>({{ values.length }})</i>
      </summary>
      <ul>
        <li v-for="(item, index) in values" :key="label + index" :class="{ selected: selectedFilterview === item.guid }"
          @click="handleSelect(item.guid)">
          <span class="title">{{ item.title }}</span>
          <div class="icon">
            <BIMDataIcon :name="selectedFilterview === item.guid ? 'show' : 'hide'"
              :color="selectedFilterview === item.guid ? 'default' : 'silver'" fill />
          </div>
        </li>
      </ul>
    </details>
  </div>
</template>

<script>
export default {
  props: {
    filterviews: Object,
    selectedFilterview: String
  },
  methods: {
    handleSelect(guid) {
      if (this.selectedFilterview === guid) {
        this.$emit("filterview-select", { guid: null });
      } else {
        this.$emit("filterview-select", { guid: guid });
      }
    },
  },
  computed:{
    filterviewsByLabels(){ //Refactor when implementing Filterview Sets!
      let data = {
        Geteilt: this.filterviews.filter(item => item.labels.includes("public")),
        Lokal: this.filterviews.filter(item => !item.labels.includes("public")),
      }
      data.Lokal.length == 0 && delete data.Lokal     
      return data
    }
  }
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

.icon {
  display: flex;
  pointer-events: none;
  margin-right: 1em;
  align-items: center;
  justify-items: center;
}
</style>
