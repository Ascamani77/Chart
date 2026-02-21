interface ImportMetaEnv {
    readonly VITE_MT5_BRIDGE_URL?: string;
    readonly VITE_MT5_BRIDGE_WS_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
