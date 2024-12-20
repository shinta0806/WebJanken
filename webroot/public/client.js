// ============================================================================
// 
// Web じゃんけんクライアントプログラム
// Copyright (C) 2024 by SHINTA
// 
// ============================================================================

// ----------------------------------------------------------------------------
// 
// ----------------------------------------------------------------------------

// vue3-sfc-loader の設定
function loadModuleOptions() {
    // https://github.com/FranckFreiburger/vue3-sfc-loader
    // getFile() addStyle() は index.ts で使用される
    return {
        moduleCache: {
            vue: Vue
        },
        async getFile(url) {
            const res = await fetch(url);
            if (!res.ok) {
                throw Object.assign(new Error(res.statusText + " " + url), { res });
            }
            return {
                getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
            }
        },
        addStyle(textContent) {
            const style = Object.assign(document.createElement("style"), { textContent });
            const ref = document.head.getElementsByTagName("style")[0] || null;
            document.head.insertBefore(style, ref);
        },
    }
}

async function client() {
    const options = loadModuleOptions();
    const { loadModule } = window["vue3-sfc-loader"];

    // アプリとコンポーネント
    let vueApp;
    let component;
    let props = {};
    const params = (new URL(location.href)).searchParams;
    const group = params.get(csConstants.params.group);
    if (group) {
        // グループが指定されている場合はゲスト
        component = "./lounge_guest.vue";
        props["groupConst"] = group;
    } else {
        // グループが指定されていない場合はホスト
        component = "./lounge_host.vue";
    }

    // document.body 配下をコンポーネントで置換
    vueApp = Vue.createApp(Vue.defineAsyncComponent(() => loadModule(component, options)), props);
    props["vueApp"] = vueApp;
    vueApp.mount(document.body);
}

client();
