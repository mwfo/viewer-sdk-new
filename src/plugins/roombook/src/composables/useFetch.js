import {ref} from "vue"
import axios from 'axios'

const cloudUrl = ref()
const bcfUrl = ref()

export default function(){

    function setupFetch(){
        cloudUrl.value = `${this.$viewer.api.apiUrl}/cloud/${this.$viewer.api.cloudId}/project/${this.$viewer.api.projectId}`
        bcfUrl.value = `${this.$viewer.api.apiUrl}/bcf/2.1/projects/${this.$viewer.api.projectId}`
        let token = `Bearer ${this.$viewer.api.accessToken}`

        axios.interceptors.request.use(function (config) {
            config.headers['Authorization'] = token,
            config.headers['Content-Type'] = "application/json"
        return config
        })
    }

    async function fetchSimpleElements(){
        if(cloudUrl.value && cloudUrl.value){
            const modelIds = [1046313]
            const data = await Promise.allSettled(
              modelIds.map((id) =>
                axios.get(cloudUrl.value + `/model/${id}/element/simple`)
                  .then(result => [id, result.data])
                  .catch((e) => console.error(`Loading Model with id "${id}" failed!`))
              )
            )
            .then(result => result.filter(item => item.status === "fulfilled"))
            .then(result => Object.fromEntries(result.map(item => item.value)))    
        return data
    } else {
        console.error("Failed to fetch Elements. Please setup useFetch().")
    }
}
    return {setupFetch, fetchSimpleElements}
}
    