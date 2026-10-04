# Tasks

## 1. Spike

- [ ] 1.1 Prove a per-format synchronous peer loader works in the ESM build, the CJS build and under test (documented result in this design)

## 2. Implementation

- [ ] 2.1 Add `NodeCryptoError` and the documented error codes under `src/shared/`
- [ ] 2.2 Add the encoding and input normalization module
- [ ] 2.3 Add the deprecation warning helper
- [ ] 2.4 Add the lazy peer loader with the missing-dependency error
- [ ] 2.5 Add the algorithm identifier validation helper

## 3. Tests

- [ ] 3.1 Test each error code and message hygiene
- [ ] 3.2 Test encodings and equivalent input types
- [ ] 3.3 Test one-warning-per-process behavior
- [ ] 3.4 Test the loader with bcrypt installed and with it missing

## 4. Documentation

- [ ] 4.1 Document error codes, encodings and deprecation codes in JSDoc and the docs site
