# Tasks

## 1. Scaffolded with the development plan (verify only)

- [x] 1.1 Create `package.json` with pinned versions, exports map, scripts and the optional bcrypt peer dependency
- [x] 1.2 Create `pnpm-workspace.yaml` and the `docs/` placeholder package
- [x] 1.3 Create `tsconfig.json`, `tsconfig.build.esm.json` and `tsconfig.build.cjs.json`
- [x] 1.4 Create `.gitignore` and add the MPL-2.0 `LICENSE` (compare its text with the official one before the first release)

## 2. Build

- [x] 2.1 Run `pnpm install` and commit the lockfile
- [x] 2.2 Add `scripts/write-dist-package-json.mjs` that writes `dist/esm/package.json` (`type: module`) and `dist/cjs/package.json` (`type: commonjs`)
- [x] 2.3 Add a smoke test that imports and requires every exported subpath from the built output
- [x] 2.4 Confirm the packed archive contains only `dist`, `LICENSE` and `README.md`

## 3. Quality gates

- [x] 3.1 Add `eslint.config.mjs` with strict typed rules, explicit typedefs, explicit return types and the `Math.random` ban
- [x] 3.2 Add `.prettierrc.json` (single quotes, no trailing commas)
- [x] 3.3 Confirm lint runs against the TypeScript 6 compatibility package while `tsc` is 7.0.2

## 4. Tests

- [x] 4.1 Add the test script using the Node built-in runner on `tests/**/*.test.ts`
- [x] 4.2 Add one placeholder test proving the runner executes TypeScript sources

## 5. Documentation

- [x] 5.1 Add a README section describing scripts and the dual-compiler setup
