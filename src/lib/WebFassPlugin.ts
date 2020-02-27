import { Core, IPlugin, IPackageRegistry, ClientHTTPUtil } from "@webfaas/webfaas-core";

import { PackageRegistryConfig } from "./PackageRegistryConfig";
import { PackageRegistry } from "./PackageRegistry";

export default class WebFassPlugin implements IPlugin {
    listRegistry: Array<IPackageRegistry> = [];
    
    async startPlugin(core: Core) {
        for (let i = 0; i < this.listRegistry.length; i++){
            let registry = this.listRegistry[i];
            await registry.start();
        }
    }

    async stopPlugin(core: Core) {
        for (let i = 0; i < this.listRegistry.length; i++){
            let registry = this.listRegistry[i];
            await registry.stop();
        }
    }

    constructor(core: Core){
        let listRegistryConfig: [] = core.getConfig().get("registry.npm", [{}]);

        for (let i = 0; i < listRegistryConfig.length; i++){
            let item: any = listRegistryConfig[i];

            let configRegistry = new PackageRegistryConfig();
            configRegistry.token = item.token || "";
            configRegistry.url = item.url || "https://registry.npmjs.org";
            if (item.http){
                configRegistry.httpConfig = ClientHTTPUtil.parseClientHTTPConfig(item.http);
            }

            let newRegistry = new PackageRegistry(configRegistry, core.getLog());
            
            let name = item.name || newRegistry.getTypeName();
            let slaveName = item.slaveName || "";
            core.getModuleManager().getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager().addRegistry(name, slaveName, newRegistry);

            this.listRegistry.push(newRegistry);
        }
    }
}