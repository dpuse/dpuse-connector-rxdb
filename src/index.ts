// Dependencies - Framework
import { AbortError, ConnectorError, FetchError, ItemTypeId, PreviewTypeId } from '@datapos/datapos-share-core';
import type { ConnectionConfig, Connector, ConnectorCallbackData, ConnectorConfig, ConnectorFieldInfo, ConnectorRecord, ItemConfig } from '@datapos/datapos-share-core';
import type { DataViewConfig, Preview, PreviewInterface, ReadInterface, ReadInterfaceSettings } from '@datapos/datapos-share-core';
import { extractExtensionFromPath, lookupMimeTypeForExtension } from '@datapos/datapos-share-core';
import type { ListItemsResult, ListItemsSettings } from '@datapos/datapos-share-core';

// Dependencies - Data
import config from './config.json';
import { version } from '../package.json';

// Constants
const CALLBACK_READ_ABORTED = 'Read aborted.';
const ERROR_LIST_ITEMS_FAILED = 'List items failed.';
const ERROR_PREVIEW_FAILED = 'Preview failed.';
const ERROR_READ_FAILED = 'Read failed.';

// Classes - RxDB Connector
export default class RxDBConnector implements Connector {
    abortController: AbortController | undefined;
    readonly config: ConnectorConfig;
    readonly connectionConfig: ConnectionConfig;

    constructor(connectionConfig: ConnectionConfig) {
        this.abortController = null;
        this.config = config as ConnectorConfig;
        this.config.version = version;
        this.connectionConfig = connectionConfig;
    }

    abort(): void {
        if (!this.abortController) return;
        this.abortController.abort();
        this.abortController = null;
    }

    getPreviewInterface(): PreviewInterface {
        return { connector: this, preview };
    }

    getReadInterface(): ReadInterface {
        return { connector: this, read };
    }

    async listItems(settings: ListItemsSettings): Promise<ListItemsResult> {
        return new Promise((resolve, reject) => {
            try {
                const itemConfigs: ItemConfig[] = [];
                resolve({ cursor: undefined, isMore: false, itemConfigs, totalCount: itemConfigs.length });
            } catch (error) {
                reject(constructErrorAndTidyUp(this, ERROR_LIST_ITEMS_FAILED, 'listItems.1', error));
            }
        });
    }
}

// Interfaces - Preview
const preview = (connector: Connector, dataViewConfig: DataViewConfig, chunkSize?: number): Promise<{ error?: unknown; result?: Preview }> => {
    return new Promise((resolve, reject) => {
        try {
            // TODO
        } catch (error) {
            reject(constructErrorAndTidyUp(connector, ERROR_PREVIEW_FAILED, 'preview.1', error));
        }
    });
};

// Interfaces - Read
const read = (connector: Connector, dataViewConfig: DataViewConfig, settings: ReadInterfaceSettings, callback: (data: ConnectorCallbackData) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            callback({ typeId: 'start', properties: { dataViewConfig, settings } });
            // Create an abort controller and get the signal. Add an abort listener to the signal.
            connector.abortController = new AbortController();
            const signal = connector.abortController.signal;
            signal.addEventListener(
                'abort',
                () => reject(constructErrorAndTidyUp(connector, ERROR_READ_FAILED, 'read.8', new AbortError(CALLBACK_READ_ABORTED)))
                /*, { once: true, signal } TODO: Don't need once and signal? */
            );
            callback({ typeId: 'end', properties: {} });
        } catch (error) {
            reject(constructErrorAndTidyUp(connector, ERROR_READ_FAILED, 'read.1', error));
        }
    });
};

// Utilities - Construct Error and Tidy Up
const constructErrorAndTidyUp = (connector: Connector, message: string, context: string, error: unknown): ConnectorError => {
    connector.abortController = null;
    return new ConnectorError(message, `${config.id}.${context}`, undefined, undefined, undefined, error);
};
