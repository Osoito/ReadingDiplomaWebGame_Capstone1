import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        env: { 'NODE_ENV': 'test' },
        globals: true,
        globalSetup: ['./tests/globalSetup.js'],
        environment: 'node',
        setupFiles: ['./tests/vitest.setup.js'],
        include: ['tests/**/*.test.js'],
        passWithNoTests: true,
        coverage: {
            provider: 'v8',
            clean: true,
            include: ['./controllers', './models', './services', './utils/middleware'],
            exclude: ['./controllers/README.md', './models/README.md', './services/README.md']
        }
    }
})