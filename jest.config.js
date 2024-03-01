/** @type {import('ts-jest').JestConfigWithTsJest} */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
    preset: 'jest-preset-angular',
    roots: ['./cngrx/src/'],
    testMatch: ['**/+(*.)+(spec).+(ts)'],
    setupFilesAfterEnv: ['./cngrx/src/test-setup.ts'],
    collectCoverage: true,
    testPathIgnorePatterns: [
        './cngrx/node_modules/',
        './cngrx/dist',
        '/e2e-'
    ],
    transform: {
        '^.+\\.spec.ts?$': ['ts-jest', {
            babel: true,
            tsConfig: './cngrx/tsconfig.spec.json',
        }]
    },
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
        prefix: './cngrx/'
    })
};
