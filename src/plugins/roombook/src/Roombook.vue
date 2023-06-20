<template>
  <div class="content">

  <button @click="test">TEST</button>


  <div class="loading" v-if="isLoading">
    <span class="loader"></span>
    <h2>{{ status }}</h2>
  </div>

  <Roomlist v-else :data="groupdata"/>

  </div>
</template>

<script>
import Roomlist from "./Roomlist.vue"
import useFetch from "./composables/useFetch.js"


export default {
  setup() {
    const { setupFetch } = useFetch()
    


    return { setupFetch }
  },
  name: "roombook",
  components: { Roomlist },
  data() {
    return {
      workers: [],
      data: null,
      status: null,
      groupdata: {}
    };
  },
  computed:{
    isLoading(){
      return this.data === null
    }
  },
  methods: {
    test(){
      this.myWorker.postMessage({type: "groupCount", pset: "attributes", property: "type"})
    }
  },
  created(){
    this.myWorker = new Worker(new URL('./worker-scripts/testWorker.js', import.meta.url))
    this.myWorker.onmessage = (e) => { 
      if(e.data?.type === "status"){
        this.status = e.data.status
        console.log(this.status)
      }
      if(e.data?.type === "data"){
        this.data = e.data
      }
      if(e.data?.type === "groupCount"){
        this.groupdata = e.data.groupdata
      }
    }
  },

  mounted() {

    this.myWorker.postMessage({ type: "status"})
    this.myWorker.postMessage({
      type: "setup", 
      url: `${this.$viewer.api.apiUrl}/cloud/${this.$viewer.api.cloudId}/project/${this.$viewer.api.projectId}`, 
      token: this.$viewer.api.accessToken
    })
    this.myWorker.postMessage({ type: "status"})
    this.myWorker.postMessage({ type: "getData"})
    this.myWorker.postMessage({ type: "refetch"})



  },
  beforeDestroy(){ 
    console.log("destroy")
    this.myWorker.terminate()    
  },


};
</script>

<style lang="scss" scoped>

.content{
  height: 100%;
}
.loading{
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  justify-self: center;
}

.loader {
  width: 48px;
  height: 48px;
  border: 3px solid #000;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
.loader::after {
    content: '';  
  box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-bottom-color: #FF3D00;
}
    
@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
} 

</style>
