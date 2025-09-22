# CreateMonitorPayload


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**monitorType** | [**MonitorType**](MonitorType.md) |  | [default to undefined]
**schedule** | **string** | Cron-like schedule string | [default to undefined]
**status** | **string** |  | [default to undefined]
**httpConfig** | [**HttpConfig**](HttpConfig.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CreateMonitorPayload } from '@pulse/shared';

const instance: CreateMonitorPayload = {
    name,
    monitorType,
    schedule,
    status,
    httpConfig,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
