# Spec Delta

## ADDED Requirements

### Requirement: Shared encoding assertion

The library SHALL provide `assertSupportedEncoding(value)` as a TypeScript assertion function with signature `assertSupportedEncoding(value: unknown): asserts value is Encoding`. It SHALL throw an `InvalidArgumentError` for any value other than `'hex'`, `'base64'` or `'base64url'` (including non-string values and `undefined`), and SHALL return `void` (narrowing `value` to `Encoding`) otherwise. It SHALL be the single membership test for the `Encoding` union used by all namespaces.

#### Scenario: Supported encoding

- **WHEN** `assertSupportedEncoding` is called with `'hex'`, `'base64'` or `'base64url'`
- **THEN** it SHALL return `void` without throwing and narrow the value to `Encoding`

#### Scenario: Unsupported string

- **WHEN** `assertSupportedEncoding` is called with any string other than `'hex'`, `'base64'` or `'base64url'`
- **THEN** it SHALL throw an `InvalidArgumentError`

#### Scenario: Non-string value

- **WHEN** `assertSupportedEncoding` is called with a number, object, array, `null`, `undefined` or any other non-string value
- **THEN** it SHALL throw an `InvalidArgumentError`

#### Scenario: Single home

- **WHEN** a namespace needs to validate an encoding argument
- **THEN** it SHALL call `assertSupportedEncoding` from `src/shared/encodings.ts` and SHALL NOT re-declare a closed set of supported encodings
