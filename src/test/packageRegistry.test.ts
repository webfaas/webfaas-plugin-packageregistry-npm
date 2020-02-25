import * as chai from "chai";
import * as mocha from "mocha";

import * as fs from "fs";
import * as path from "path";

import { Log, LogLevelEnum, ClientHTTPConfig } from "@webfaas/webfaas-core";

import { PackageRegistry } from "../lib/PackageRegistry";
import { PackageRegistryConfig } from "../lib/PackageRegistryConfig";


var log = new Log();
log.changeCurrentLevel(LogLevelEnum.OFF);

describe("Package Registry", () => {
    var packageRegistry_default = new PackageRegistry();
    var packageRegistry_full = new PackageRegistry(new PackageRegistryConfig("http://", undefined, "token1"), log);
    
    it("should return properties", function(){
        chai.expect(packageRegistry_default.getTypeName()).to.eq("npm");
        chai.expect(packageRegistry_full.getTypeName()).to.eq("npm");
        chai.expect(typeof(packageRegistry_full.getConfig())).to.eq("object");
    })

    it("buildHeaders - default", function(){
        let headers = packageRegistry_default.buildHeaders();
        headers["user-agent"] = "webfaas";
        chai.expect(headers["user-agent"]).to.eq("webfaas");
    })

    it("buildHeaders - full", function(){
        let headers = packageRegistry_full.buildHeaders();
        headers["user-agent"] = "webfaas";
        chai.expect(headers["user-agent"]).to.eq("webfaas");
        chai.expect(headers["authorization"]).to.eq("Bearer token1");
    })
})

describe("Package Registry - getPackage", () => {
    var packageRegistry_default = new PackageRegistry();

    it("getPackage - uuid 3.4.0", async function(){
        let eTag_first: string = "";
        let packageRegistryResponse1 = await packageRegistry_default.getPackage("uuid", "3.4.0");
        chai.expect(packageRegistryResponse1).to.not.null;
        if (packageRegistryResponse1){
            let packageStore = packageRegistryResponse1.packageStore;
            chai.expect(packageStore).to.not.null;
            if (packageStore){
                eTag_first = packageStore.getEtag();
                chai.expect(packageStore.getEtag().length).to.gte(0);

                let manifest = packageStore.getManifest();
                chai.expect(manifest).to.not.null;
                if (manifest){
                    chai.expect(manifest.name).to.eq("uuid");
                    chai.expect(manifest.version).to.eq("3.4.0");
                    chai.expect(manifest.notfound).to.eq(undefined);
                }
            }
        }

        //retry with etag
        let packageRegistryResponse2 = await packageRegistry_default.getPackage("uuid", "3.4.0", eTag_first);
        chai.expect(packageRegistryResponse2).to.not.null;
        chai.expect(packageRegistryResponse2.packageStore).to.null;
        chai.expect(packageRegistryResponse2.etag).to.eq(eTag_first);
    })

    it("getPackage - notfound***", async function(){
        let packageRegistryResponse = await packageRegistry_default.getPackage("notfound***", "3.4.0");
        chai.expect(packageRegistryResponse.etag).to.eq("");
        chai.expect(packageRegistryResponse.packageStore).to.be.null;
    })

    it("getPackage - @@@@", async function(){
        try {
            let packageRegistryResponse = await packageRegistry_default.getPackage("@@@@", "@@@@");
            throw new Error("Sucess!");
        }
        catch (error) {
            chai.expect(error).to.eq(405);
        }
    })

    it("getPackage - mock error", async function(){
        var packageRegistry_error = new PackageRegistry();
        packageRegistry_error.buildHeaders = function(){
            throw new Error("simulate error");
        }
        try {
            let packageRegistryResponse = await packageRegistry_error.getPackage("@@@@", "@@@@");
            throw new Error("Sucess!");
        }
        catch (error) {
            chai.expect(error.message).to.eq("simulate error");
        }
    })
})

describe("Package Registry - getManifest", () => {
    var packageRegistry_default = new PackageRegistry();

    it("getManifest - uuid", async function(){
        let eTag_first: string = "";
        let packageRegistryResponse1 = await packageRegistry_default.getManifest("uuid");
        chai.expect(packageRegistryResponse1).to.not.null;
        if (packageRegistryResponse1){
            let packageStore = packageRegistryResponse1.packageStore;
            chai.expect(packageStore).to.not.null;
            if (packageStore){
                eTag_first = packageStore.getEtag();
                chai.expect(packageStore.getEtag().length).to.gte(0);

                let manifest = packageStore.getManifest();
                chai.expect(manifest).to.not.null;
                if (manifest){
                    chai.expect(manifest.name).to.eq("uuid");
                    chai.expect(manifest.version).to.eq(undefined);
                    chai.expect(manifest.notfound).to.eq(undefined);
                }
            }
        }

        //retry with etag
        let packageRegistryResponse2 = await packageRegistry_default.getManifest("uuid", eTag_first);
        chai.expect(packageRegistryResponse2).to.not.null;
        chai.expect(packageRegistryResponse2.packageStore).to.null;
        chai.expect(packageRegistryResponse2.etag).to.eq(eTag_first);
    })

    it("getManifest - notfound***", async function(){
        let packageRegistryResponse = await packageRegistry_default.getManifest("notfound***");
        chai.expect(packageRegistryResponse.etag).to.eq("");
        chai.expect(packageRegistryResponse.packageStore).to.be.null;
    })

    it("getManifest - @@@@", async function(){
        try {
            let packageRegistryResponse = await packageRegistry_default.getManifest("@@@@");
            throw new Error("Sucess!");
        }
        catch (error) {
            chai.expect(error).to.eq(405);
        }
    })

    it("getManifest - mock error", async function(){
        var packageRegistry_error = new PackageRegistry();
        packageRegistry_error.buildHeaders = function(){
            throw new Error("simulate error");
        }
        try {
            let packageRegistryResponse = await packageRegistry_error.getManifest("@@@@");
            throw new Error("Sucess!");
        }
        catch (error) {
            chai.expect(error.message).to.eq("simulate error");
        }
    })
})