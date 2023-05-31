<template>
    <div :style="propStyle">
        <input ref="input" type="text" :class="{select: isSelect}" v-model="localValue" @blur="$emit('input', localValue)"
            :disabled="disabled" :readonly="isSelect"/>
        <div v-if="type !== 'text'" class="dropdown" :style="propStyle">
            <div class="item" v-for="(item, index) in currentElements" :key="index" @mousedown="localValue = item">{{
                item }}</div>
        </div>
    </div>
</template>
  
<script>
export default {
        //Strange mix of Vue2.x und Vue3 Syntax... Revisit with updated SDK
        //v-model works differntly for Vue 2.x...
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
        type: {
            type: String,
            default: 'default'
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
        currentElements() {
            if (this.localValue == null || this.type == 'select') {
                return this.options
            } else {
                let regex = new RegExp(this.localValue.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/[*?]/g, '\.$&'), "i")
                return this.options.filter(item => regex.test(item))
            }
        },
        propStyle() {
            return {
                width: this.width,
            }
        },
        isSelect(){
                return this.type === 'select'
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
  