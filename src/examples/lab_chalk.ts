"use strict";

import { ModuleManager } from "@webfaas/webfaas-core";

import { PackageRegistry } from "../lib/PackageRegistry";

var moduleManager = new ModuleManager();
moduleManager.getPackageStoreManager().getPackageRegistryManager().addRegistry("npm", "", new PackageRegistry());

(async function(){
    try {
        var moduleObj: any = await moduleManager.import("chalk", "3", undefined, "npm");

        if (moduleObj){
            console.log("module loaded", moduleObj);
            console.log("supportsColor", moduleObj.supportsColor);
            console.log("Level", moduleObj.Level);
            moduleObj.blue("Hello world!");
        }
        else{
            console.log("module not loaded");
        }
    }
    catch (errTry) {
        console.log("errExample: ", errTry);
    }
})();