import { Subject } from 'rxjs';
import { RepositoryConfig } from './repository.config';

export class Repository<T> {
    public onItemAdded$: Subject<T> = new Subject();
    public onItemRemoved$: Subject<T> = new Subject();

    private _collection: Map<string, T>;
    private _orderedCollection: T[];
    private _id: string;
    private _fallbackKey: string | undefined;
    private _allowItemOverwrite = true;

    constructor(config?: RepositoryConfig) {
        this._collection = new Map();
        this._orderedCollection = [];
        this._id = config && config.id ? config.id : 'Repository';
        this._fallbackKey = config?.fallbackKey ?? undefined;
        this._allowItemOverwrite = config?.allowItemOverwrite ?? true;
    }

    public get fallbackValue(): T | undefined {
        return this._fallbackKey ? this._collection.get(this._fallbackKey) : undefined;
    }

    public get availableItemsOrdered(): T[] {
        return this._orderedCollection;
    }

    public get availableItemsMap(): Map<string, T> {
        return this._collection;
    }

    public get availableItemsIds(): string[] {
        const items: string[] = [];

        this._collection.forEach((value: T, key: string) => items.push(key));

        return items.sort();
    }

    public addItem(id: string, item: T): void {
        if (!this._allowItemOverwrite && this._collection.get(id)) {
            console.warn(`
                ${this._id}.ItemOverwrite Error.
                The repository is configured to not allow overwrites.

                Trying to overwrite item with id: ${id}
            `);

            return;
        }

        this._collection.set(id, item);
        this._orderedCollection.push(item);
        this.onItemAdded$.next(item);
    }

    public addByRecord(record: Record<string, T> = {}): void {
        Object.keys(record).forEach((key: string) => this.addItem(key, record[key]));
    }

    public get(id: string): T | undefined {

        const fallbackValue = this.fallbackValue;

        if (!id) {
            if (!fallbackValue) {
                this._handleUndefinedIdError(id, 'get(id: string)');
            }

            return fallbackValue;
        }

        const item = this._collection.get(id);

        if (!item) {
            this._handleElementNotFoundError(id);
            return this.fallbackValue;
        }

        return item;
    }

    public removeById(id: string): void {
        const item = this._collection.get(id);
        if (item) {
            this._collection.delete(id);
            this._orderedCollection = this._orderedCollection.filter((elem) => elem !== item);
            this.onItemRemoved$.next(item);
        }
    }

    private _handleElementNotFoundError(id: string): void {
        console.warn(`
            ${this._id}.ItemNotFoundError
            Item "${id}" is not in the repository,

            AvaliableItems:

            ${this.availableItemsIds.join(` `)}
        `);
    }

    private _handleUndefinedIdError(id: string, methodsName: string): void {
        console.warn(`
        ${this._id}. ${methodsName} invoked with an undefined id.

        AvaliableItems:

        ${this.availableItemsIds.join(`
        `)}`);
    }
}
