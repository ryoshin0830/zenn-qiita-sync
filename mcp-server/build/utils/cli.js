import { execSync } from 'child_process';
import path from 'path';
// Get the project root directory
export function getProjectRoot() {
    // Go up from mcp-server/build/utils to the project root
    const currentFile = new URL(import.meta.url).pathname;
    return path.resolve(path.dirname(currentFile), '../../../');
}
// Execute CLI command in project root
export function execInProjectRoot(command, options = {}) {
    const projectRoot = getProjectRoot();
    return execSync(command, {
        ...options,
        cwd: projectRoot,
        env: {
            ...process.env,
            PATH: `${projectRoot}/node_modules/.bin:${process.env.PATH}`
        }
    });
}
// Check if we're in the correct directory
export function ensureProjectRoot() {
    const projectRoot = getProjectRoot();
    if (process.cwd() !== projectRoot) {
        process.chdir(projectRoot);
    }
}
//# sourceMappingURL=cli.js.map