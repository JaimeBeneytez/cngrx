import { Repository } from './repository';

describe('Repository', () => {
    let repo: Repository<string>;
    const warn = jest.spyOn(console, 'warn');

    beforeEach(() => {
        repo = new Repository<string>({ id: 'foo' });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
    });

    describe('PROPERTIES', () => {
        describe('[ .availableItemsIds: string[] ( Read only ) ] ', () => {
            describe('WHEN the repository is empty', () => {
                it('returns an empty array', () => {
                    expect(repo.availableItemsIds).toEqual([]);
                });
            });

            describe('WHEN the repository has items', () => {
                beforeEach(() => repo.addByRecord({ foo: 'bar', bar: 'baz' }));

                it('returns an array containing the available keys sorted by key', () => {
                    expect(repo.availableItemsIds).toContain('foo');
                    expect(repo.availableItemsIds).toContain('bar');
                });
            });
        });

        describe('[ .availableItemsOrdered: T[] (Read only) ]', () => {
            describe('WHEN the repository is empty', () => {
                it('returns an empty array', () => {
                    expect(repo.availableItemsOrdered).toEqual([]);
                });
            });

            describe('WHEN the repository has items added individually', () => {
                beforeEach(() => {
                    repo.addItem('foo', 'alice');
                    repo.addItem('bar', 'bob');
                });

                it('returns an array containing the available items sorted by insertion order', () => {
                    expect(repo.availableItemsOrdered[0]).toEqual('alice');
                    expect(repo.availableItemsOrdered[1]).toContain('bob');
                });
            });

            describe('WHEN the repository has items added by map', () => {
                beforeEach(() => repo.addByRecord({ foo: 'alice', bar: 'bob' }));

                it('returns an array containing the available items sorted by insertion order', () => {
                    expect(repo.availableItemsOrdered[0]).toEqual('alice');
                    expect(repo.availableItemsOrdered[1]).toContain('bob');
                });
            });

            describe('WHEN the repository has had items deleted', () => {
                beforeEach(() => {
                    repo.addByRecord({ foo: 'alice', bar: 'bob' });
                    repo.removeById('foo');
                });

                it('returns an array in insertion order without the deleted item', () => {
                    expect(repo.availableItemsOrdered).not.toContain('alice');
                });
            });
        });
    });

    describe('METHODS', () => {
        describe('[ .get( key: string ): T ]', () => {
            beforeEach(() => repo.addByRecord({ foo: 'bar' }));

            describe('WHEN the key is undefined', () => {
                describe('AND fallbackKey HAS been provided in configuration', () => {
                    beforeEach(() => {
                        repo = new Repository<string>({
                            fallbackKey: 'default',
                        });
                        repo.addItem('default', 'default value');
                    });

                    it('returns the configured fallbackKey', () => {
                        expect(repo.get('foobar')).toBe('default value');
                    });
                });

                describe('AND fallbackKey HAS NOT been provided in configuration', () => {

                    beforeEach(() => {
                        repo = new Repository<string>({});
                        repo.get('foobar');
                    });

                    it('invokes .warn on the console', () => {
                        expect(console.warn).toHaveBeenCalled();
                    });
                });
            });

            describe('WHEN the key EXIST in the repo', () => {
                it('returns the value assigned to that key', () => {
                    expect(repo.get('foo')).toBe('bar');
                });
            });

            describe('WHEN the key does NOT EXIST in the repo', () => {
                describe('AND fallbackKey HAS been provided in configuration', () => {
                    beforeEach(() => {
                        repo.get('bar');
                    });

                    it('invokes .warn on the console', () => {
                        expect(console.warn).toHaveBeenCalled();
                    });
                });

                describe('AND fallbackKey HAS NOT been provided in configuration', () => {
                    let result: string | undefined;

                    beforeEach(() => {
                        repo = new Repository<string>({
                            fallbackKey: 'default',
                        });
                        repo.addItem('default', 'default value');
                        result = repo.get('bar');
                    });

                    it('invokes .warn on the console', () => {
                        expect(console.warn).toHaveBeenCalled();
                    });

                    it('returns the configured fallbackKey', () => {
                        expect(result).toBe('default value');
                    });
                });
            });
        });

        describe('[ .addItem(string, item): void ]', () => {
            describe('WHEN the key EXIST on the repository', () => {
                beforeEach(() => {
                    repo.addByRecord({ foo: 'bar' });
                    repo.addItem('foo', 'baz');
                });

                it('overrides its value with the new value', () => {
                    expect(repo.get('foo')).toBe('baz');
                });
            });

            describe('WHEN the key does NOT EXIST on the repository', () => {
                beforeEach(() => repo.addItem('bar', 'baz'));

                it('adds the [key,value] to the repo', () => {
                    expect(repo.get('bar')).toBe('baz');
                });
            });
        });

        describe('[ .addByRecord(object): void ]', () => {
            beforeEach(() => {
                repo.addByRecord({ foo: 'bar' });
                repo.addByRecord({ foo: 'baz', bar: 'baz' });
            });

            it('adds the key:value pairs to the repo overriding the existing ones', () => {
                expect(repo.get('foo')).toBe('baz');
                expect(repo.get('bar')).toBe('baz');
            });
        });

        describe(' [ .deleteByID(id: string): void ] ', () => {
            beforeEach(() => repo.addByRecord({ foo: 'bar' }));

            describe('WHEN the id does EXIST in the repo', () => {
                beforeEach(() => repo.removeById('foo'));

                it('returns the value assigned to that key', () => {
                    expect(repo.get('foo')).toBe(undefined);
                });
            });
        });
    });
});
