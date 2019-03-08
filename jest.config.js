module.exports = {
    roots: ['<rootDir>/test'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '\\.(t|j)sx?$',
    moduleFileExtensions: ['ts','tsx','js','jsx','json','node']
}