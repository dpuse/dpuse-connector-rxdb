// Dependencies - Framework
import { AbortError, ConnectorError, FetchError, ItemTypeId, PreviewTypeId } from '@datapos/datapos-share-core';
import type { ConnectionConfig, Connector, ConnectorCallbackData, ConnectorConfig, ConnectorFieldInfo, ConnectorRecord, ItemConfig } from '@datapos/datapos-share-core';
import type { DataViewConfig, Preview, PreviewInterface, ReadInterface, ReadInterfaceSettings } from '@datapos/datapos-share-core';
import { extractExtensionFromPath, lookupMimeTypeForExtension } from '@datapos/datapos-share-core';
import type { ListItemsResult, ListItemsSettings } from '@datapos/datapos-share-core';

// Dependencies - Data
import config from './config.json';
import { version } from '../package.json';

// Classes - File Store Emulator Connector
export default class FileStoreEmulatorConnector implements Connector {
    abortController: AbortController | undefined;
    readonly config: ConnectorConfig;
    readonly connectionConfig: ConnectionConfig;
}
