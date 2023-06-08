<template>
    <div :style="propStyle">
        <input ref="input" type="text" :class="{select: !disabled}" 
        :value="!useKey ? localValue : localValue && $t(`FilterviewsPlugin.${localValue}`)" 
        @blur="$emit('input', localValue)"
            :disabled="disabled" readonly/>
        <div class="dropdown" :style="propStyle">
            <div class="item" v-for="(item, index) in optionsList" :key="index" @mousedown="localValue = item">{{
                useKey ? $t(`FilterviewsPlugin.${item}`) : item}}</div>
        </div>
    </div>
</template>
  
<script>
export default {
        //Strange mix of Vue2.x und Vue3 Syntax... Revisit with updated SDK
        //v-model works differently for Vue 2.x...
    props: {
        options: {
            type: Array,
            default: () => []
        },
        disabled: {
            type: Boolean,
            default: false
        },
        value: {
            type: [String, Number],
            default: null,
        },
        //Width for Dropdown should be Width of Input... Listener required
        width: {
            type: String,
            default: '8em'
        },
        useKey: {
            type: Boolean,
            default: false
        }
        
    },
    data(){
        return{
            localValue: ""
        }
    },
    emit:['input'],
    mounted(){
        this.localValue = this.value 
    },
    computed: {
        optionsList(){
            console.log(this.options)
            if(this.useKey){
                return Object.keys(this.options).filter(item => item !== 'null')
            } else {
                return this.options
            }
        },
        propStyle() {
            return {
                width: this.width,
            }
        }
    },
}
</script>
  
<style lang="scss" scoped>
input {
    width: 100%;
    height: 2em;
    border: none;
    outline: none;
    box-sizing:border-box;
    border-bottom: 1px solid #aaaaaa;
    text-overflow: ellipsis;
    font-size: inherit;
    font-weight: inherit;
}

input:focus{
    border-bottom: 2px solid #2f374a;
}


.select{
    cursor: pointer;
}

.dropdown {
    display: none;
    cursor: pointer;
    max-height: 18em;
    overflow-y: scroll;
    position: absolute;
    background: #ffffffdd;
    box-shadow: #00000022 0 2px 10px 0;
    z-index: 100;
}

input:focus+.dropdown {
    display: block;
}

.item {
    padding: 0.5em;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.item:hover {
    font-weight: bold;
    background: #aaaaaaaa;
}
</style>
  