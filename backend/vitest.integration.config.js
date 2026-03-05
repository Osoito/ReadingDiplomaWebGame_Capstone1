import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        env: { 'NODE_ENV': 'test' },
        globals: true,
        globalSetup: ['./tests/testConfig/globalSetup.js'],
        environment: 'node',
        //setupFiles: ['./tests/testConfig/vitest.setup.js'],
        include: ['tests/integration/**/*.test.js'],
        passWithNoTests: true,
        coverage: {
            enabled: true,
            provider: 'istanbul', // v8 is not supported by Node.js 18, changed this to istanbul
            clean: true,
            include: ['./controllers', './models', './services', './utils/middleware'],
            exclude: ['./controllers/README.md', './models/README.md', './services/README.md']
        }
    }
})