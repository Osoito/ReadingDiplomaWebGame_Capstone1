import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        env: { 'NODE_ENV': 'test' },
        globals: true,
        environment: 'node',
        setupFiles: ['./tests/vitest.setup.js'],
        include: ['tests/**/*.test.js'],
        passWithNoTests: true,
        /*coverage: {
            clean: true,
            reportsDirectory: './tests/coverage',
            reporter: [
            ]
        }*/
    }
})