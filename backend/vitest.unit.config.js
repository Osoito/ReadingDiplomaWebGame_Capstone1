import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        env: { 'NODE_ENV': 'test' },
        globals: true,
        environment: 'node',
        include: ['tests/unit/**/*.test.js'],
        globalSetup: ['./tests/testConfig/globalSetupUnit.js'],
        passWithNoTests: true
    }
})
