# flagd

[flagd](https://github.com/open-feature/flagd) is a feature flag evaluation engine that implements the OpenFeature protocol. It provides a lightweight, fast, and secure way to manage feature flags in your applications.

For our use, flagd is run as a standalone service using http as the flag configuration source (Our API `GET /flagd`).

For more details, check out the [official documentation](https://flagd.dev/).

## Getting started

```shell
docker compose up flagd
```

## Flag scoping with flagSetId

Each flag is tagged with a `flagSetId` in the format `<app-name>-<environment>` (e.g. `my-app-development`). flagd loads all flags from all applications into a single namespace, so flag keys are only unique within an application. To scope resolution to a specific application and environment, pass the `Flagd-Selector` header with your requests:

```
Flagd-Selector: flagSetId=<app-name>-<environment>
```

Without this header, flagd resolves against all flags globally and the result is non-deterministic when the same key exists in multiple applications.

## Resolving flags with curl

You can use the flagd evaluation service, documented [here](https://flagd.dev/reference/specifications/protos/#service) to fetch flags via curl.

> [!IMPORTANT]
> flagd uses [protobuffs](https://protobuf.dev/), which is reflected in its documentation, but the documented method names map to http endpoints. So `ResolveAll` method maps to the following rest endpoint `flagd.evaluation.v1.Service/ResolveAll`

While flags are normally fetched by a client app via an OpenFeature Provider, it can be helpful to use curl to see the state of different flags for debugging.

> [!NOTE]
> The following examples point to a local flagd instance. Update the URL depending on which flagd instance you want to hit.

### Fetching all flags

Returns all enabled flags in flagd's memory:

```shell
curl --request POST \
  --url http://localhost:8013/flagd.evaluation.v1.Service/ResolveAll \
  --header 'Content-Type: application/json' \
  --data '{}'
```

### Fetching a specific flag

Resolve an individual flag using the method matching its type. Pass the `Flagd-Selector` header to scope resolution to your application and environment. Example for a boolean flag:

```shell
curl --request POST \
  --url http://localhost:8013/flagd.evaluation.v1.Service/ResolveBoolean \
  --header 'Content-Type: application/json' \
  --header 'Flagd-Selector: flagSetId=<app-name>-<environment>' \
  --data '{"flag_key": "<flag-key>"}'
```

To resolve a different value type, use the corresponding method — `ResolveString`, `ResolveInt`, `ResolveFloat`, or `ResolveObject`. See the [full method reference](https://flagd.dev/reference/specifications/protos/#service).

## Resolving flags via OFREP

flagd also exposes an [OFREP](https://openfeature.dev/specification/appendix-c) REST API on port `8016`. Pass the same `Flagd-Selector` header to scope evaluation to your application and environment:

```shell
curl --request POST \
  --url http://localhost:8016/ofrep/v1/evaluate/flags/<flag-key> \
  --header 'Content-Type: application/json' \
  --header 'Flagd-Selector: flagSetId=<app-name>-<environment>' \
  --data '{"context": {}}'
```
