import { Core, IPlugin } from "@webfaas/webfaas-core";

import WebFassPlugin from "./WebFassPlugin";

export default function(core: Core): IPlugin{
    return new WebFassPlugin(core);
}