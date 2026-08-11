import { createRuntimeHost, disposePreviousRuntime } from './app/runtime-host.js';
import { startLegacyRuntime } from 'virtual:quick-interaction-core';

disposePreviousRuntime();

const runtimeHost = createRuntimeHost('QiAct');
window.__QiActRuntimeHost = runtimeHost;

// BC 程式碼沙盒提供的正式卸載協定。回呼在同步执行阶段登记，
// 因此即使旧核心之后经过 await 才建立 timer，也能在「停止」时完整清除。
if (typeof window.__bcSandboxOnClear === 'function') {
    window.__bcSandboxOnClear(() => {
        const api = window.__QiAct;
        if (api && api.state && api.state.disposed === false && typeof api.dispose === 'function') api.dispose();
        else runtimeHost.dispose();
    });
}

try {
    startLegacyRuntime(runtimeHost);
} catch (error) {
    runtimeHost.dispose();
    if (window.__QiActRuntimeHost === runtimeHost) delete window.__QiActRuntimeHost;
    throw error;
}
