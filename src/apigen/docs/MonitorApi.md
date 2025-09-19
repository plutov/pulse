# MonitorApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMonitor**](#createmonitor) | **POST** /monitors | Create Monitor|
|[**listMonitors**](#listmonitors) | **GET** /monitors | List Monitors|

# **createMonitor**
> Monitor createMonitor(createMonitorPayload)


### Example

```typescript
import {
    MonitorApi,
    Configuration,
    CreateMonitorPayload
} from './api';

const configuration = new Configuration();
const apiInstance = new MonitorApi(configuration);

let createMonitorPayload: CreateMonitorPayload; //

const { status, data } = await apiInstance.createMonitor(
    createMonitorPayload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createMonitorPayload** | **CreateMonitorPayload**|  | |


### Return type

**Monitor**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | ok |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listMonitors**
> Array<Monitor> listMonitors()


### Example

```typescript
import {
    MonitorApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MonitorApi(configuration);

const { status, data } = await apiInstance.listMonitors();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Monitor>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | ok |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

