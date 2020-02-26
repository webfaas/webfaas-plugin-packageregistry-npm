import { IncomingHttpHeaders } from "http";

import { Log } from "@webfaas/webfaas-core";
import { IPackageRegistry, IPackageRegistryResponse } from "@webfaas/webfaas-core";
import { PackageStoreUtil, PackageStore, IPackageStoreItemData } from "@webfaas/webfaas-core";
import { ClientHTTP, ModuleNameUtil, IClientHTTPResponse } from "@webfaas/webfaas-core";

import { PackageRegistryConfig } from "./PackageRegistryConfig";

export class PackageRegistry implements IPackageRegistry {
    private config: PackageRegistryConfig;
    private clientHTTP: ClientHTTP;
    private log: Log;
    
    constructor(config?: PackageRegistryConfig, log?: Log){
        this.config = config || new PackageRegistryConfig();
        this.log = log || new Log();

        this.clientHTTP = new ClientHTTP(this.config.httpConfig, this.log);
    }

    buildHeaders(): IncomingHttpHeaders{
        var headers: IncomingHttpHeaders = {};

        headers["user-agent"] = "webfaas";
        if (this.config.token){
            headers["authorization"] = "Bearer " + this.config.token;
        }
        return headers;
    }

    /**
     * return eTag
     * @param value 
     */
    parseETag(value: any): string{
        if (value){
            return value.toString();
        }
        else{
            return "";
        }
    }

    /**
     * return type name
     */
    getTypeName(): string{
        return "npm";
    }

    /**
     * return config
     */
    getConfig(): PackageRegistryConfig{
        return this.config;
    }

    /**
     * return manifest in IPackageRegistryResponse
     * @param name manifest name
     * @param etag manifest etag
     */
    getManifest(name: string, etag?: string): Promise<IPackageRegistryResponse>{
        return new Promise(async (resolve, reject) => {
            try {
                var headers: IncomingHttpHeaders = this.buildHeaders();
                var manifestResponseObj = {} as IPackageRegistryResponse;
                
                //optimized npm package metadata response payload (https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
                headers["accept"] = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*";
                if (etag){
                    headers["If-None-Match"] = etag;
                }

                var url = this.config.url + "/" + name;

                var respHTTP: IClientHTTPResponse = await this.clientHTTP.request(url, "GET", undefined, headers);

                if (respHTTP.statusCode === 200){
                    var header_etag: string = this.parseETag(respHTTP.headers["etag"])

                    manifestResponseObj.packageStore = PackageStoreUtil.buildPackageStoreFromListBuffer(name, "", header_etag, [respHTTP.data], ["package.json"]);

                    resolve(manifestResponseObj);
                }
                else if (respHTTP.statusCode === 304){ //NOT MODIFIED
                    manifestResponseObj.packageStore = null;
                    manifestResponseObj.etag = etag || "";

                    resolve(manifestResponseObj);
                }
                else if (respHTTP.statusCode === 404){ //NOT FOUND
                    manifestResponseObj.packageStore = null;
                    manifestResponseObj.etag = "";

                    resolve(manifestResponseObj);
                }
                else{
                    reject(respHTTP.statusCode);
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    /**
     * return package in IPackageRegistryResponse
     * @param name package name
     * @param version package version
     * @param etag package etag
     */
    getPackage(name: string, version: string, etag?: string): Promise<IPackageRegistryResponse> {
        return new Promise(async (resolve, reject) => {
            try {
                var headers: IncomingHttpHeaders = this.buildHeaders();
                var packageResponseObj = {} as IPackageRegistryResponse;
                
                //optimized npm package metadata response payload (https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)
                headers["accept"] = "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*";
                if (etag){
                    headers["If-None-Match"] = etag;
                }

                let moduleNameData = ModuleNameUtil.parse(name, "");
                
                var url = this.config.url + "/" + moduleNameData.moduleName + "/-/" + moduleNameData.moduleNameWhitOutScopeName + "-" + version + ".tgz";

                var respHTTP: IClientHTTPResponse = await this.clientHTTP.request(url, "GET", undefined, headers);
                
                if (respHTTP.statusCode === 200){
                    var header_etag: string = this.parseETag(respHTTP.headers["etag"])
                    
                    packageResponseObj.packageStore = PackageStoreUtil.buildPackageStoreFromTarGzBuffer(name, version, header_etag, respHTTP.data);

                    resolve(packageResponseObj);
                }
                else if (respHTTP.statusCode === 304){ //NOT MODIFIED
                    packageResponseObj.packageStore = null;
                    packageResponseObj.etag = etag || "";

                    resolve(packageResponseObj);
                }
                else if (respHTTP.statusCode === 404){ //NOT FOUND
                    packageResponseObj.packageStore = null;
                    packageResponseObj.etag = "";

                    resolve(packageResponseObj);
                }
                else{
                    reject(respHTTP.statusCode);
                }
            }
            catch (errTry) {
                reject(errTry);
            }
        });
    }

    start(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve();
        })
    }

    stop(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.clientHTTP.destroy();
            resolve();
        })
    }
}