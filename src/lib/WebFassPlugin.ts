import { Core, IPlugin, IPackageRegistry } from "@webfaas/webfaas-core";

import { PackageRegistryConfig } from "./PackageRegistryConfig";
import { PackageRegistry } from "./PackageRegistry";

export default class WebFassPlugin implements IPlugin {
    registry: IPackageRegistry;
    
    async startPlugin(core: Core) {
        await this.registry.start();
    }

    async stopPlugin(core: Core) {
        await this.registry.stop();
    }

    constructor(core: Core){
        let configRegistry = new PackageRegistryConfig();
        this.registry = new PackageRegistry(configRegistry, core.getLog());
        core.getModuleManager().getPackageStoreManager().getPackageRegistryManager().addRegistry(this.registry.getTypeName(), "", this.registry);
    }
}