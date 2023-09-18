import { BehaviorSubject, Observable } from 'rxjs';
import type { BulkWriteRow, EventBulk, RxConflictResultionTask, RxConflictResultionTaskSolution, RxDocumentData, RxDocumentDataById, RxJsonSchema, RxStorageBulkWriteResponse, RxStorageChangeEvent, RxStorageCountResult, RxStorageDefaultCheckpoint, RxStorageInstance, RxStorageInstanceCreationParams, RxStorageQueryResult, StringKeys } from '../../types';
import { MongoDBPreparedQuery, MongoDBStorageInternals, RxStorageMongoDBInstanceCreationOptions, RxStorageMongoDBSettings } from './mongodb-types';
import { RxStorageMongoDB } from './rx-storage-mongodb';
import { Db as MongoDatabase, Collection as MongoCollection, MongoClient, ObjectId, ClientSession } from 'mongodb';
export declare class RxStorageInstanceMongoDB<RxDocType> implements RxStorageInstance<RxDocType, MongoDBStorageInternals, RxStorageMongoDBInstanceCreationOptions, RxStorageDefaultCheckpoint> {
    readonly storage: RxStorageMongoDB;
    readonly databaseName: string;
    readonly collectionName: string;
    readonly schema: Readonly<RxJsonSchema<RxDocumentData<RxDocType>>>;
    readonly internals: MongoDBStorageInternals;
    readonly options: Readonly<RxStorageMongoDBInstanceCreationOptions>;
    readonly settings: RxStorageMongoDBSettings;
    readonly primaryPath: StringKeys<RxDocumentData<RxDocType>>;
    readonly inMongoPrimaryPath: string;
    closed: boolean;
    private readonly changes$;
    readonly mongoClient: MongoClient;
    readonly mongoDatabase: MongoDatabase;
    readonly mongoCollectionPromise: Promise<MongoCollection<RxDocumentData<RxDocType> | any>>;
    /**
     * Closing the connection must not happen when
     * an operation is running, otherwise we get an error.
     * So we store all running operations here so that
     * they can be awaited.
     */
    readonly runningOperations: BehaviorSubject<number>;
    readonly runningWrites: BehaviorSubject<number>;
    /**
     * We use this to be able to still fetch
     * the objectId after transforming the document from mongo-style (with _id)
     * to RxDB
     */
    readonly mongoObjectIdCache: WeakMap<RxDocumentData<RxDocType>, ObjectId>;
    constructor(storage: RxStorageMongoDB, databaseName: string, collectionName: string, schema: Readonly<RxJsonSchema<RxDocumentData<RxDocType>>>, internals: MongoDBStorageInternals, options: Readonly<RxStorageMongoDBInstanceCreationOptions>, settings: RxStorageMongoDBSettings);
    /**
     * Bulk writes on the mongodb storage.
     * Notice that MongoDB does not support cross-document transactions
     * so we have to do a update-if-previous-is-correct like operations.
     * (Similar to what RxDB does with the revision system)
     */
    bulkWrite(documentWrites: BulkWriteRow<RxDocType>[], context: string): Promise<RxStorageBulkWriteResponse<RxDocType>>;
    findDocumentsById(docIds: string[], withDeleted: boolean, session?: ClientSession): Promise<RxDocumentDataById<RxDocType>>;
    query(preparedQuery: MongoDBPreparedQuery<RxDocType>): Promise<RxStorageQueryResult<RxDocType>>;
    count(preparedQuery: MongoDBPreparedQuery<RxDocType>): Promise<RxStorageCountResult>;
    getChangedDocumentsSince(limit: number, checkpoint?: RxStorageDefaultCheckpoint): Promise<{
        documents: RxDocumentData<RxDocType>[];
        checkpoint: RxStorageDefaultCheckpoint;
    }>;
    cleanup(minimumDeletedTime: number): Promise<boolean>;
    getAttachmentData(_documentId: string, _attachmentId: string, _digest: string): Promise<string>;
    changeStream(): Observable<EventBulk<RxStorageChangeEvent<RxDocumentData<RxDocType>>, RxStorageDefaultCheckpoint>>;
    remove(): Promise<void>;
    close(): Promise<void>;
    conflictResultionTasks(): Observable<RxConflictResultionTask<RxDocType>>;
    resolveConflictResultionTask(_taskSolution: RxConflictResultionTaskSolution<RxDocType>): Promise<void>;
}
export declare function createMongoDBStorageInstance<RxDocType>(storage: RxStorageMongoDB, params: RxStorageInstanceCreationParams<RxDocType, RxStorageMongoDBInstanceCreationOptions>, settings: RxStorageMongoDBSettings): Promise<RxStorageInstanceMongoDB<RxDocType>>;
