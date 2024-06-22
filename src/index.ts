// Dependencies - Framework
import { AbortError, ConnectorError, FetchError } from '@datapos/datapos-share-core';
import type { ConnectionConfig, ConnectionItemConfig, Connector, ConnectorCallbackData, ConnectorConfig, DataViewPreviewConfig, ReadRecord } from '@datapos/datapos-share-core';
import type { ListResult, ListSettings } from '@datapos/datapos-share-core';
import type { PreviewInterface, PreviewResult, PreviewSettings } from '@datapos/datapos-share-core';
import type { ReadInterface, ReadSettings } from '@datapos/datapos-share-core';

// Dependencies - Data
import config from './config.json';
import { version } from '../package.json';

// Constants
const CALLBACK_PREVIEW_ABORTED = 'Connector preview aborted.';
const CALLBACK_READ_ABORTED = 'Connector read aborted.';
const ERROR_LIST_ITEMS_FAILED = 'Connector list items failed.';
const ERROR_PREVIEW_FAILED = 'Connector preview failed.';
const ERROR_READ_FAILED = 'Connector read failed.';

// Classes - Application Emulator Connector
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

    async list(callback: (data: ConnectorCallbackData) => void, settings: ListSettings): Promise<ListResult> {
        return new Promise((resolve, reject) => {
            try {
                const connectionItemConfigs: ConnectionItemConfig[] = [];
                resolve({ cursor: undefined, isMore: false, connectionItemConfigs, totalCount: connectionItemConfigs.length });
            } catch (error) {
                reject(constructErrorAndTidyUp(this, ERROR_LIST_ITEMS_FAILED, 'listItems.1', error));
            }
        });
    }
}

// Interfaces - Preview
const preview = (
    connector: Connector,
    callback: (data: ConnectorCallbackData) => void,
    connectionItemConfig: ConnectionItemConfig,
    settings: PreviewSettings
): Promise<{ error?: unknown; result?: PreviewResult }> => {
    return new Promise((resolve, reject) => {
        try {
            // Create an abort controller. Get the signal for the abort controller and add an abort listener.
            connector.abortController = new AbortController();
            const signal = connector.abortController.signal;
            signal.addEventListener('abort', () => reject(constructErrorAndTidyUp(connector, ERROR_PREVIEW_FAILED, 'preview.6', new AbortError(CALLBACK_PREVIEW_ABORTED))));

            // Fetch chunk from start of file.
            resolve({ result: { data: [], typeId: 'table' } });
        } catch (error) {
            reject(constructErrorAndTidyUp(connector, ERROR_PREVIEW_FAILED, 'preview.1', error));
        }
    });
};

// Interfaces - Read
const read = (
    connector: Connector,
    callback: (data: ConnectorCallbackData) => void,
    connectionItemConfig: ConnectionItemConfig,
    previewConfig: DataViewPreviewConfig,
    settings: ReadSettings
): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            callback({ typeId: 'start', properties: {} });
            // Create an abort controller and get the signal. Add an abort listener to the signal.
            connector.abortController = new AbortController();
            const signal = connector.abortController.signal;
            signal.addEventListener(
                'abort',
                () => reject(constructErrorAndTidyUp(connector, ERROR_READ_FAILED, 'read.10', new AbortError(CALLBACK_READ_ABORTED)))
                /*, { once: true, signal } TODO: Don't need once and signal? */
            );
            settings.chunk([] as ReadRecord[]);

            resolve();
        } catch (error) {
            reject(constructErrorAndTidyUp(connector, ERROR_READ_FAILED, 'read.1', error));
        }
    });
};

// Utilities - Construct Error and Tidy Up
const constructErrorAndTidyUp = (connector: Connector, message: string, context: string, error: unknown): unknown => {
    connector.abortController = null;
    return new ConnectorError(message, `${config.id}.${context}`, undefined, undefined, error);
};
