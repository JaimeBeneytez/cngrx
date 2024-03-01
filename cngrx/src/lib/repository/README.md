# Repository

## CONSTRUCTOR

    - **(config?: RepositoryConfig)**

## CONFIGURATION

    - **id:string :** the id of the repo for errors logging.
    - **fallbackKey :**
        - WHEN trying to retrieve an inexistent key:
        - if configured returns the fallback.
        - if not configured throws an error.

## PROPERTIES

    - **.availableItemsIds: string[] ( Read only )**
        - WHEN the repository is empty
            - returns an empty array
        - WHEN the repository has items
            - returns an array containing the available keys sorted by key

## METHODS

    - **.get( key: string ): T**
        - WHEN the key is undefined
            - AND fallbackKey HAS been provided in configuration
                - returns the configured fallbackKey
            - AND fallbackKey HAS NOT been provided in configuration
                - invokes .warn on the console
        - WHEN the key EXIST in the repo
            - returns the value assigned to that key
        - WHEN the key does NOT EXIST in the repo
            - AND fallbackKey HAS been provided in configuration
                - invokes .warn on the console
            - AND fallbackKey HAS NOT been provided in configuration
                - invokes .warn on the console
            - returns the configured fallbackKey

    - **.addItem(string, item): void**
        - WHEN the key EXIST on the repository
            - overrides its value with the new value
        - WHEN the key does NOT EXIST on the repository
            - adds the [key,value] to the repo
    - **.addByRecord(object): void**
        - adds the key:value pairs to the repo overriding the existing ones
