# Monitor


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**monitorType** | [**MonitorType**](MonitorType.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**author** | [**User**](User.md) |  | [default to undefined]
**schedule** | **string** | Cron-like schedule string | [default to undefined]
**status** | **string** |  | [default to undefined]
**httpConfig** | [**HttpConfig**](HttpConfig.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Monitor } from '@pulse/shared';

const instance: Monitor = {
    id,
    name,
    monitorType,
    createdAt,
    updatedAt,
    author,
    schedule,
    status,
    httpConfig,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
