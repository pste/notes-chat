import { ref, watch, onScopeDispose } from 'vue'

export default function useLocalStorage(key, defaultValue) {
    const item = ref(defaultValue || null)

    // recover latest version from local storage
    const storageItem = window.localStorage.getItem(key)
    if (storageItem) {
        item.value = JSON.parse(storageItem)
    }
    else {
        /* NOOP - already defaulted to defaultValue */
    }

    //install window event listeners
    window.addEventListener("storage", handleStorageEvent)
    onScopeDispose( () => window.removeEventListener("storage", handleStorageEvent), true )

    function handleStorageEvent(evt) {
        if (evt.key === key) {
            item.value = JSON.parse(evt.newValue || "null")
        }
    }

    // react to vue events
    watch( item, (newValue) => {
        window.localStorage.setItem(key, JSON.stringify(newValue))
    }, {
        deep: true, 
        immediate: true,
    }) 

    // returning the vue ref
    return item
}