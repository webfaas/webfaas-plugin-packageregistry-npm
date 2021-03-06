import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";

import { Core, LogLevelEnum } from "@webfaas/webfaas-core";

import WebFassPlugin from "../lib/WebFassPlugin";
import { Config } from "@webfaas/webfaas-core/lib/Config/Config";

describe("Plugin", () => {
    it("start and stop - new", async function(){
        let core = new Core();
        let plugin = new WebFassPlugin(core);
        chai.expect(typeof(plugin)).to.eq("object");
        core.getLog().changeCurrentLevel(LogLevelEnum.OFF);
        await plugin.startPlugin(core);
        await plugin.stopPlugin(core);
        await plugin.stopPlugin(core); //retry stop

        //config
        let configData = {
            "registry":{
                "npm": [
                    {
                        "name": "npm2",
                        "url": "https://registry.npmjs.org",
                        "http": {
                            "timeout": 100
                        }
                    }
                ]
            }
        }
        let config = new Config();
        config.read(configData);
        let core2 = new Core( config );
        
        let plugin2 = new WebFassPlugin(core2);
        core2.getLog().changeCurrentLevel(LogLevelEnum.OFF);
        chai.expect(core2.getPackageRegistryManager().getRegistryItem("npm2")).to.not.null;
        chai.expect(core2.getPackageRegistryManager().getRegistryItem("npm2")?.name).to.eq("npm2");
    })
})