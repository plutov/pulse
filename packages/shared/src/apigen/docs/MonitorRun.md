# MonitorRun


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**monitor** | [**MonitorMinimal**](MonitorMinimal.md) |  | [default to undefined]
**status** | [**RunStatus**](RunStatus.md) |  | [default to undefined]
**durationMs** | **number** |  | [default to undefined]
**details** | [**HttpRunDetails**](HttpRunDetails.md) |  | [default to undefined]

## Example

```typescript
import { MonitorRun } from '@pulse/shared';

const instance: MonitorRun = {
    id,
    createdAt,
    monitor,
    status,
    durationMs,
    details,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
