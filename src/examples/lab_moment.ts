"use strict";

import { ModuleManager } from "@webfaas/webfaas-core";

import { PackageRegistry } from "../lib/PackageRegistry";

var moduleManager = new ModuleManager();
moduleManager.getModuleManagerImport().getPackageStoreManager().getPackageRegistryManager().addRegistry("npm", "", new PackageRegistry());

(async function(){
    try {
        var moduleObj: any = await moduleManager.getModuleManagerImport().import("moment", "2.24.0", undefined, "npm");
        
        if (moduleObj){
            console.log("module loaded", moduleObj);
            console.log("format => ", moduleObj().format());
        }
        else{
            console.log("module not loaded");
        }
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();