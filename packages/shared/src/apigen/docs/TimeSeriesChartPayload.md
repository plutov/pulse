# TimeSeriesChartPayload


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**monitorIds** | **Array&lt;string&gt;** |  | [default to undefined]
**start** | **string** |  | [optional] [default to undefined]
**end** | **string** |  | [optional] [default to undefined]
**interval** | [**ChartInterval**](ChartInterval.md) |  | [default to undefined]
**timeRange** | [**ChartInterval**](ChartInterval.md) |  | [default to undefined]

## Example

```typescript
import { TimeSeriesChartPayload } from '@pulse/shared';

const instance: TimeSeriesChartPayload = {
    monitorIds,
    start,
    end,
    interval,
    timeRange,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
