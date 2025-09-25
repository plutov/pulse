# ChartsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getTimeSeriesChartData**](#gettimeserieschartdata) | **POST** /charts/timeSeries | Get Time Series Chart Data|

# **getTimeSeriesChartData**
> TimeSeriesChartData getTimeSeriesChartData(timeSeriesChartPayload)


### Example

```typescript
import {
    ChartsApi,
    Configuration,
    TimeSeriesChartPayload
} from '@pulse/shared';

const configuration = new Configuration();
const apiInstance = new ChartsApi(configuration);

let timeSeriesChartPayload: TimeSeriesChartPayload; //

const { status, data } = await apiInstance.getTimeSeriesChartData(
    timeSeriesChartPayload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **timeSeriesChartPayload** | **TimeSeriesChartPayload**|  | |


### Return type

**TimeSeriesChartData**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | ok |  -  |
|**400** | 400 |  -  |
|**401** | 401 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

