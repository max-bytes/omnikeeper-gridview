import useSwaggerClient from "utils/useSwaggerClient";

export default function useGridViewPluginManager() {
    const { data: swaggerClient, loading: swaggerClientLoading, error: swaggerClientError } = useSwaggerClient();

    try {
        let plugin;
        try { plugin = require("okplugin-grid-view"); } catch(e) { return []; }
            
        // create props
        const pluginProps={
            swaggerClient: swaggerClient,
        }
        const PluginComponents = plugin.default(pluginProps); // thows and error, if plugin doesn't have a default export

        const gridView = {
            name: plugin.name,
            title: plugin.title,
            path: plugin.path,
            icon: plugin.icon ? plugin.icon : "",
            version: plugin.version,
            description: plugin.description,
            components: PluginComponents
        }

        const pluginObjects = {
            getGridView() {
                return gridView;
            },
        }

        // 'loading' and 'error' get passed through from useSwaggerClient()
        return { data: pluginObjects, loading: swaggerClientLoading, error: swaggerClientError };

    } catch(e) {
        return { data: null, loading: false, error: e };
    }
}