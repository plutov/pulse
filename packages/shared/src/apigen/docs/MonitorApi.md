# MonitorApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMonitor**](#createmonitor) | **POST** /monitors | Create Monitor|
|[**deleteMonitor**](#deletemonitor) | **DELETE** /monitors/{id} | Delete Monitor|
|[**getMonitorById**](#getmonitorbyid) | **GET** /monitors/{id} | Get Monitor by ID|
|[**listMonitors**](#listmonitors) | **GET** /monitors | List Monitors|

# **createMonitor**
> Monitor createMonitor(createMonitorPayload)


### Example

```typescript
import {
    MonitorApi,
    Configuration,
    CreateMonitorPayload
} from '@pulse/apigen';

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

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | ok |  -  |
|**400** | 400 |  -  |
|**401** | 401 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteMonitor**
> deleteMonitor()


### Example

```typescript
import {
    MonitorApi,
    Configuration
} from '@pulse/apigen';

const configuration = new Configuration();
const apiInstance = new MonitorApi(configuration);

let id: string; //Monitor ID (default to undefined)

const { status, data } = await apiInstance.deleteMonitor(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Monitor ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Monitor deleted successfully |  -  |
|**400** | 400 |  -  |
|**401** | 401 |  -  |
|**404** | 404 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMonitorById**
> Monitor getMonitorById()


### Example

```typescript
import {
    MonitorApi,
    Configuration
} from '@pulse/apigen';

const configuration = new Configuration();
const apiInstance = new MonitorApi(configuration);

let id: string; //Monitor ID (default to undefined)

const { status, data } = await apiInstance.getMonitorById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] | Monitor ID | defaults to undefined|


### Return type

**Monitor**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | ok |  -  |
|**400** | 400 |  -  |
|**401** | 401 |  -  |
|**404** | 404 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listMonitors**
> Array<Monitor> listMonitors()


### Example

```typescript
import {
    MonitorApi,
    Configuration
} from '@pulse/apigen';

const configuration = new Configuration();
const apiInstance = new MonitorApi(configuration);

const { status, data } = await apiInstance.listMonitors();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Monitor>**

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | ok |  -  |
|**401** | 401 |  -  |
|**500** | 500 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

